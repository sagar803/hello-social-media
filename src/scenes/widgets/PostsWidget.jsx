import { useEffect, useRef, useState } from "react";
import PostWidget from "./PostWidget";
import { Box, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";

const PostsWidget = ({ userId, isProfile = false }) => {
  const token = useSelector((state) => state.token);
  const [posts, setPosts] = useState([]); 
  const [page, setPage] = useState(1);    
  const [loading, setLoading] = useState(false); 
  const [hasMore, setHasMore] = useState(true); 
  const loadRef = useRef();
  const [inView, setInView] = useState(false);

  console.log(posts.length);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting);
      },{ threshold: 0.1 } 
    );

    if (loadRef.current) observer.observe(loadRef.current);
    return () => {
      if (loadRef.current) observer.unobserve(loadRef.current);
    };
  }, []);


  const getFeedPosts = async () => {
    if (loading || !hasMore) return;  
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/posts?page=${page}&limit=5`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch posts");
      const newPosts = await response.json();
      if (newPosts.length < 5) setHasMore(false);
  
      const allPosts = [...posts, ...newPosts];
      setPosts(allPosts);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  
    setLoading(false);
  };
  
  const getUserPosts = async () => {
    const response = await fetch(`${process.env.REACT_APP_API}/posts/${userId}/posts?page=${page}&limit=5`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch posts");
    const newPosts = await response.json();
    if (newPosts.length < 5) setHasMore(false);

    const allPosts = [...posts, ...newPosts];
    setPage((prevPage) => prevPage + 1);
    setPosts(allPosts);
  };


  useEffect(() => {
    if(inView && !loading){
      if (isProfile) getUserPosts();
      else getFeedPosts();
    }
  }, [inView]);

  return (
    <>
      {posts && posts?.map(
        ({
          _id,
          userId,
          firstName,
          lastName,
          description,
          location,
          picturePath,
          userPicturePath,
          likes,
          comments,
        }) => (
          <PostWidget
            key={_id}
            postId={_id}
            postUserId={userId}
            name={`${firstName} ${lastName}`}
            description={description}
            location={location}
            picturePath={picturePath}
            userPicturePath={userPicturePath}
            likes={likes}
            comments={comments}
          />
        )
      )}
      <div ref={loadRef}></div>
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          <CircularProgress />
        </Box>
      )}
      {!hasMore && <p>No more posts to load.</p>}
    </>
  );
};

export default PostsWidget;
