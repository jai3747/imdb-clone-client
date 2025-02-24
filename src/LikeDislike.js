import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";


export function LikeDislike() {
  const [like, setLike] = useState(0);
  const [dislike, setDisLike] = useState(0);
  return (
    <div className="button-group">
      <IconButton
        color="primary"
        onClick={() => setLike(like + 1)}
        aria-label="like Button"
      >
        <ThumbUpOffAltIcon /> {like}
      </IconButton>
      <IconButton
        color="error"
        onClick={() => setDisLike(dislike + 1)}
        aria-label="dislike button"
      >
        <ThumbDownOffAltIcon />
        {dislike}
      </IconButton>
      {/* <button className="like" onClick={() => setLike(like + 1)}>
              👍{like}
            </button>
            <button className="dislike" onClick={() => setDisLike(dislike + 1)}>
              👎{dislike}
            </button>*/}
    </div>
  );
}
