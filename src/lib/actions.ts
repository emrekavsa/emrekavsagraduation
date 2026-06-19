"use server"
import { supabase } from "@/lib/supabase"
import * as v from "valibot"
import type { ActionResult } from "@/types/domain"

const createPollSchema = v.object({
  title: v.pipe(v.string(), v.minLength(3, "Title must be at least 3 characters")),
  category: v.string(),
  user_id: v.pipe(v.string(), v.uuid("Invalid user ID"))
})

const voteSchema = v.object({
  poll_id: v.pipe(v.string(), v.uuid("Invalid poll ID")),
  option_id: v.pipe(v.string(), v.uuid("Invalid option ID")),
  user_id: v.pipe(v.string(), v.uuid("Invalid user ID"))
})

const createCommentSchema = v.object({
  poll_id: v.pipe(v.string(), v.uuid("Invalid poll ID")),
  user_id: v.pipe(v.string(), v.uuid("Invalid user ID")),
  content: v.pipe(v.string(), v.minLength(1, "Comment cannot be empty")),
  parent_id: v.optional(v.nullable(v.pipe(v.string(), v.uuid("Invalid parent ID"))))
})

const deleteCommentSchema = v.object({
  comment_id: v.pipe(v.string(), v.uuid("Invalid comment ID")),
  user_id: v.pipe(v.string(), v.uuid("Invalid user ID"))
})

const updateCommentSchema = v.object({
  comment_id: v.pipe(v.string(), v.uuid("Invalid comment ID")),
  user_id: v.pipe(v.string(), v.uuid("Invalid user ID")),
  content: v.pipe(v.string(), v.minLength(1, "Comment cannot be empty"))
})

const reportSchema = v.pipe(
  v.object({
    poll_id: v.optional(v.pipe(v.string(), v.uuid("Invalid poll ID"))),
    comment_id: v.optional(v.pipe(v.string(), v.uuid("Invalid comment ID"))),
    reported_by: v.pipe(v.string(), v.uuid("Invalid user ID")),
    reason: v.optional(v.string())
  }),
  v.check(data => Boolean(data.poll_id || data.comment_id), "Either poll_id or comment_id must be provided")
)

type CreatePollInput = v.InferOutput<typeof createPollSchema>
type VoteInput = v.InferOutput<typeof voteSchema>
type CreateCommentInput = v.InferOutput<typeof createCommentSchema>
type DeleteCommentInput = v.InferOutput<typeof deleteCommentSchema>
type UpdateCommentInput = v.InferOutput<typeof updateCommentSchema>
type ReportInput = v.InferOutput<typeof reportSchema>

type CreatePollOptionInput = {
  option_type?: string
  content: string
  image_url?: string | null
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong"

async function assertAdmin(adminId: string) {
  if (!adminId) throw new Error("Unauthorized: Admin ID is required")

  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', adminId)
    .single()

  if (!data?.is_admin) throw new Error("Unauthorized")
}

export async function createPollAction(
  pollData: CreatePollInput,
  optionsData: CreatePollOptionInput[]
): Promise<ActionResult<{ pollId: string }>> {
  try {
    const validatedData = v.parse(createPollSchema, pollData)

    const { data: poll, error: pollErr } = await supabase
      .from("polls")
      .insert([validatedData])
      .select()
      .single()

    if (pollErr) throw new Error(pollErr.message)

    const options = optionsData.map(opt => ({
      poll_id: poll.id,
      option_type: opt.option_type || 'text',
      content: opt.content,
      image_url: opt.image_url
    }))

    const { error: optionsErr } = await supabase
      .from("poll_options")
      .insert(options)

    if (optionsErr) throw new Error(optionsErr.message)

    return { success: true, pollId: poll.id }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function voteAction(voteData: VoteInput): Promise<ActionResult> {
  try {
    const validatedData = v.parse(voteSchema, voteData)

    const { error } = await supabase
      .from('votes')
      .insert([validatedData])

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function createCommentAction(commentData: CreateCommentInput): Promise<ActionResult> {
  try {
    const validatedData = v.parse(createCommentSchema, commentData)

    const { error } = await supabase
      .from('comments')
      .insert([validatedData])

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteCommentAction(data: DeleteCommentInput): Promise<ActionResult> {
  try {
    const validatedData = v.parse(deleteCommentSchema, data)

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', validatedData.comment_id)
      .eq('user_id', validatedData.user_id)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateCommentAction(data: UpdateCommentInput): Promise<ActionResult> {
  try {
    const validatedData = v.parse(updateCommentSchema, data)
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('comments')
      .update({ content: validatedData.content, updated_at: now })
      .eq('id', validatedData.comment_id)
      .eq('user_id', validatedData.user_id)

    if (error) throw new Error(error.message)

    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function reportAction(data: ReportInput): Promise<ActionResult> {
  try {
    const validatedData = v.parse(reportSchema, data)

    const insertData: {
      reported_by: string
      reason?: string
      status: string
      poll_id?: string
      comment_id?: string
    } = {
      reported_by: validatedData.reported_by,
      reason: validatedData.reason,
      status: 'pending'
    }

    if (validatedData.poll_id) insertData.poll_id = validatedData.poll_id
    if (validatedData.comment_id) insertData.comment_id = validatedData.comment_id

    const { error } = await supabase
      .from('reports')
      .insert([insertData])

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
export async function banUserAction(adminId: string, userId: string, status = true): Promise<ActionResult> {
  try {
    await assertAdmin(adminId)

    if (status === true) {
      await supabase.from('comments').delete().eq('user_id', userId)
      await supabase.from('votes').delete().eq('user_id', userId)
      await supabase.from('polls').delete().eq('user_id', userId)
    }

    const { error } = await supabase
      .from('profiles')
      .update({ isbanned: status })
      .eq('id', userId)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function resolveReportAction(adminId: string, reportId: string): Promise<ActionResult> {
  try {
    await assertAdmin(adminId)

    const { error } = await supabase
      .from('reports')
      .update({ status: 'resolved' })
      .eq('id', reportId)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deletePollAction(userId: string, pollId: string): Promise<ActionResult> {
  try {
    if (!userId) throw new Error("Unauthorized")

    const { data: poll } = await supabase.from('polls').select('user_id').eq('id', pollId).single()
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', userId).single()

    if (poll?.user_id !== userId && !profile?.is_admin) throw new Error("Unauthorized")

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId)

    if (error) throw new Error(error.message)
    return { success: true }
  } catch (error) {
    return { success: false, error: getErrorMessage(error) }
  }
}
