"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import PollCard from "@/components/PollCard";
import Login from "@/components/Login";

export default function Home() {
  const { user, isDark, loading: authLoading } = useApp();
  const [polls, setPolls] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchPolls = useCallback(async (isInitial = false) => {
    if (dataLoading || (!isInitial && !hasMore)) return;

    setDataLoading(true);
    
    let query = supabase
      .from("polls")
      .select("id, title, created_at, profiles(username), poll_options(id, content, image_url, votes(user_id))")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!isInitial && polls.length > 0) {
      query = query.lt("created_at", polls[polls.length - 1].created_at);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPolls((prev) => (isInitial ? data : [...prev, ...data]));
      if (data.length < 5) setHasMore(false);
    }
    setDataLoading(false);
  }, [polls, dataLoading, hasMore]);

  useEffect(() => {
    fetchPolls(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
      if (isAtBottom && !dataLoading && hasMore) fetchPolls();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPolls, dataLoading, hasMore]);

  const handleVote = async (pollId, optionId) => {
    if (!user) return setIsLoginOpen(true);

    const { error } = await supabase
      .from("votes")
      .insert([{ poll_id: pollId, option_id: optionId, user_id: user.id }]);

    if (error) {
      alert(error.code === "23505" ? "Already voted!" : "An error occurred.");
    } else {
      setPolls(prevPolls => prevPolls.map(poll => {
        if (poll.id === pollId) {
          const updatedOptions = poll.poll_options.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votes: [...(opt.votes || []), { user_id: user.id }] };
            }
            return opt;
          });
          return { ...poll, poll_options: updatedOptions };
        }
        return poll;
      }));
    }
  };

  if (authLoading) return null;

  return (
    <div className={`min-h-screen ${isDark ? "bg-black text-white" : "bg-gray-50 text-black"}`}>
      <Navbar onShowLogin={() => setIsLoginOpen(true)} />

      <div className="max-w-xl mx-auto p-4 mt-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Polls</h1>
          <p className="text-gray-500">Participate and vote in community polls.</p>
        </div>

        <div className="flex flex-col gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              user={user}
              onVote={handleVote}
              isDark={isDark}
            />
          ))}
        </div>

        {dataLoading && (
          <div className="text-center py-10 font-semibold text-blue-500">Loading...</div>
        )}
      </div>

      <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} isDark={isDark} />
    </div>
  );
}