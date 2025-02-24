import { useState } from "react";
import Button from "@mui/material/Button";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import { CardActions, CardContent } from "@mui/material";
import { LikeDislike } from "./LikeDislike";

export function MovieCard({
  id,
  name,
  desc,
  director,
  yearOfRelease,
  poster,
  producer,
  actors = [], // Provide default empty array
  deleteButton,
  editButton,
}) {
  const [show, setShow] = useState(false);

  return (
    <Card className="movie-container">
      <CardMedia
        component="img"
        className="movie-poster"
        src={poster}
        alt={name}
      />
      <CardContent>
        <div className="movie-specs">
          <h3 className="movie-name">
            {name}
            <Button onClick={() => setShow(!show)}>
              {show ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>
            <span className="yearOfRelease">{yearOfRelease}</span>
          </h3>
        </div>
      </CardContent>

      {show ? <p className="movie-summary">{desc}</p> : ""}
      <div>
        <p className="label">
          Director : <span className="names">{director}</span>
        </p>
        <p className="label">
          Producer : <span className="names">
            {producer && producer.name ? producer.name : "Unknown"}
          </span>
        </p>
        <p className="label">
          Actors :{" "}
          <span className="names">
            {Array.isArray(actors) && actors.length > 0 
              ? actors.map((actor, index) => (
                  <span key={actor._id || index}>
                    {actor.name}{index < actors.length - 1 ? ", " : ""}
                  </span>
                ))
              : "Unknown"}
          </span>
        </p>
      </div>
      <div className="custom-buttons">
        <CardActions>
          <LikeDislike />
        </CardActions>
        <div>
          {editButton}
          {deleteButton}
        </div>
      </div>
    </Card>
  );
}