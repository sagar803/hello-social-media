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


  const getPosts = async () => {
    if (loading || !hasMore) return;  
    setLoading(true);    
    let endpoint = isProfile ? `posts/${userId}/posts` : 'posts';

    try {
      const response = await fetch(`${process.env.REACT_APP_API}/${endpoint}?page=${page}&limit=5`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch posts");
      const newPosts = await response.json();
      console.log(newPosts)
      if (newPosts.length < 5) setHasMore(false);
  
      const allPosts = [...posts, ...newPosts];
      setPosts(allPosts);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    setLoading(false);
  };
  

  useEffect(() => {
    if(inView && !loading) getPosts();
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
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" width="100%">
          <CircularProgress />
        </Box>
      )}
      {!hasMore && <p>No more posts to load.</p>}
      <div ref={loadRef}></div>
    </>
  );
};

export default PostsWidget;
