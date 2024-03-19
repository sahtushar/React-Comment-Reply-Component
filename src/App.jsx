import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./styles.css";
import deleteIcon from "./delete.svg";
import arrowUpIcon from "./arrow-up.png";
import arrowDownIcon from "./arrow-down.png";

const PostCard = ({ name, comment, setName, setComment, handlePost }) => {
  return (
    <div className="post-card">
      <h5>Comment</h5>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        placeholder="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button className="" onClick={handlePost}>
        Post
      </button>
    </div>
  );
};

const CommentCard = ({
  comment,
  handleReply,
  handleEditComment,
  handleDeleteComment,
  handleDeleteReply,
  handleEditReply, // Add handleEditReply to the props
}) => {
  const { id, name, comment: commentText, date, replies } = comment;
  const [replyingTo, setReplyingTo] = useState(false);
  const [reply, setReply] = useState("");
  const [nameReply, setNameReply] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedComment, setEditedComment] = useState(commentText);

  const handlePostReply = () => {
    if (nameReply.trim() === "" || reply.trim() === "") {
      alert("Please enter both name and reply");
      return;
    }

    handleReply(id, nameReply, reply);
    setNameReply("");
    setReply("");
    setReplyingTo(false);
  };

  const handleSaveEdit = () => {
    if (editedComment.trim() === "") {
      alert("Please enter Valid Comment");
      return;
    }
    handleEditComment(id, editedComment);
    setIsEditing(false);
  };

  return (
    <div className="comment-card">
      <div className="comment-header">
        <div className="commenter">{name}</div>
        <div className="dateandTime">{new Date(date).toLocaleString()}</div>
      </div>
      {isEditing ? (
        <textarea
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
        />
      ) : (
        <div>{commentText}</div>
      )}
      <div className="comment-actions">
        <button onClick={() => setReplyingTo(!replyingTo)}>Reply</button>
        {isEditing ? (
          <button onClick={handleSaveEdit}>Save</button>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}
        <button className="delete" onClick={() => handleDeleteComment(id)}>
          <img src={deleteIcon} alt="delete" />
        </button>
      </div>
      {replyingTo && (
        <div className="reply-card">
          <span>Reply</span>
          <input
            type="text"
            placeholder="Name"
            value={nameReply}
            onChange={(e) => setNameReply(e.target.value)}
          />
          <textarea
            placeholder="Reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <button className="post-reply" onClick={handlePostReply}>
            Post Reply
          </button>
        </div>
      )}
      {replies.map((reply) => (
        <ReplyCard
          key={reply.id}
          parentId={id}
          reply={reply}
          handleDeleteReply={handleDeleteReply}
          handleEditReply={handleEditReply} // Pass handleEditReply
        />
      ))}
    </div>
  );
};

const ReplyCard = ({ reply, handleDeleteReply, parentId, handleEditReply }) => {
  const { id, name, comment, date } = reply;
  const [isEditing, setIsEditing] = useState(false);
  const [editedReply, setEditedReply] = useState(comment);

  const handleSaveEdit = useCallback(() => {
    if (editedReply.trim() === "") {
      alert("Please enter Valid Comment");
      return;
    }
    handleEditReply(parentId, id, editedReply); // Pass parentId, id, and editedReply
    setIsEditing(false);
  }, [editedReply, handleEditReply, parentId, id]);

  return useMemo(
    () => (
      <div className="reply-card">
        <div className="comment-header">
          <div className="commenter">{name}</div>
          <div className="dateandTime">{new Date(date).toLocaleString()}</div>
        </div>
        {isEditing ? (
          <textarea
            value={editedReply}
            onChange={(e) => setEditedReply(e.target.value)}
          />
        ) : (
          <div>{comment}</div>
        )}
        <button
          className="delete"
          onClick={() => handleDeleteReply(parentId, id)}
        >
          <img src={deleteIcon} alt="delete" />
        </button>
        {isEditing ? (
          <button className="reply-buttons" onClick={handleSaveEdit}>
            Save
          </button>
        ) : (
          <button className="reply-buttons" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
      </div>
    ),
    [
      name,
      date,
      comment,
      isEditing,
      editedReply,
      parentId,
      id,
      handleDeleteReply,
      handleSaveEdit,
    ]
  );
};

const CommentsSection = () => {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sortByDate, setSortByDate] = useState(false);

  useEffect(() => {
    const savedComments = JSON.parse(localStorage.getItem("comments")) || [];
    setComments(savedComments);
  }, []);

  const handlePost = useCallback(() => {
    if (name.trim() === "" || comment.trim() === "") {
      alert("Please enter both name and comment");
      return;
    }

    const newComment = {
      id: Date.now(),
      name,
      comment,
      date: new Date().toISOString(),
      replies: [],
    };

    setComments((prevComments) => [...prevComments, newComment]);
    setName("");
    setComment("");
    localStorage.setItem("comments", JSON.stringify([...comments, newComment]));
  }, [name, comment, comments]);

  const handleReply = useCallback(
    (parentId, name, reply) => {
      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [
              ...comment.replies,
              {
                id: Date.now(),
                name,
                comment: reply,
                date: new Date().toISOString(),
              },
            ],
          };
        }
        return comment;
      });

      setComments(updatedComments);
      localStorage.setItem("comments", JSON.stringify(updatedComments));
    },
    [comments]
  );

  const handleEditComment = useCallback(
    (parentId, updatedComment) => {
      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            comment: updatedComment,
          };
        }
        return comment;
      });

      setComments(updatedComments);
      localStorage.setItem("comments", JSON.stringify(updatedComments));
    },
    [comments]
  );

  const handleDeleteComment = useCallback(
    (commentId) => {
      const updatedComments = comments.filter(
        (comment) => comment.id !== commentId
      );
      setComments(updatedComments);
      localStorage.setItem("comments", JSON.stringify(updatedComments));
    },
    [comments]
  );

  const handleDeleteReply = useCallback(
    (parentId, replyId) => {
      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.filter((reply) => reply.id !== replyId),
          };
        }
        return comment;
      });

      setComments(updatedComments);
      localStorage.setItem("comments", JSON.stringify(updatedComments));
    },
    [comments]
  );

  const handleEditReply = useCallback(
    (parentId, replyId, editedReply) => {
      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map((reply) => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  comment: editedReply,
                };
              }
              return reply;
            }),
          };
        }
        return comment;
      });

      setComments(updatedComments);
      localStorage.setItem("comments", JSON.stringify(updatedComments));
    },
    [comments]
  );

  const handleSortByDate = useCallback(() => {
    const sortedComments = [...comments].sort((a, b) => {
      if (sortByDate) {
        return new Date(a.date) - new Date(b.date);
      } else {
        return new Date(b.date) - new Date(a.date);
      }
    });

    setSortByDate((prevSortByDate) => !prevSortByDate);
    setComments(sortedComments);
  }, [comments, sortByDate]);

  return (
    <div className="comments-section">
      <PostCard
        name={name}
        comment={comment}
        setName={setName}
        setComment={setComment}
        handlePost={handlePost}
      />
      <div className="sort-by" onClick={handleSortByDate}>
        <p>Sort by: Date and Time</p>
        {sortByDate ? (
          <img className="arrow" src={arrowUpIcon} alt="up arrow" />
        ) : (
          <img className="arrow" src={arrowDownIcon} alt="down arrow" />
        )}
      </div>
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          handleReply={handleReply}
          handleEditComment={handleEditComment}
          handleDeleteComment={handleDeleteComment}
          handleDeleteReply={handleDeleteReply}
          handleEditReply={handleEditReply} // Pass handleEditReply
        />
      ))}
    </div>
  );
};

export default CommentsSection;
