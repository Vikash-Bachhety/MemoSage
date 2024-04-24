const express = require("express");
// const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000
const connection = mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("DB successfully cononected");
  })
  .catch((err) => {
    console.log("DB not connected", err);
  });

const notesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "No name"
  },
  details: {
    type: String,
    required: true,
  },
},{timestamps:true});

const Notes = mongoose.model("Notes", notesSchema);

app.get("/", async (req, res) => {
  try {
    const notes = await Notes.find({});
    res.render("index", { notes });
    console.log(notes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/create", async (req, res) => {
  try {
    const { title, details } = req.body;
    await Notes.create({
      title: title.trim(),
      details: details.trim(),
    });
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/files/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const note = await Notes.findOne({ title: filename });
    if (!note) {
      return res.status(404).send("Note Not Found");
    }
    res.render("detail", { name: filename, data: note.details });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/edit/:title", async (req, res) => {
  try {
    const title = req.params.title;
    const note = await Notes.findOne({ title: title });
    if (!note) {
      return res.status(404).send("Note Not Found");
    }
    res.render("edit", { note });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/edit", async (req, res) => {
  try {
    const { oldName, newName, newDetails } = req.body;
    const updatedNote = await Notes.findOneAndUpdate(
      { title: oldName },
      { details: newDetails},
      { new: true }
    );
    console.log(updatedNote);
    if (!updatedNote) {
      return res.status(404).send("Note Not Found");
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/delete/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const deletedNote = await Notes.findOneAndDelete({ title: filename });
    if (!deletedNote) {
      return res.status(404).send("Note Not Found");
    }
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/", (req, res) => {
//   fs.readdir("./files", "utf-8", (err, files) => {
//     if (err) throw err;
//     res.render("index", { files });
//   });
// });

// app.post("/create", (req, res) => {
//   const { title, details } = req.body;
//   const fileName = `./files/${title.split(" ").join("").toLowerCase()}.txt`;
//   fs.writeFile(fileName, details, (err) => {
//     if (err) throw err;
//     res.redirect("/");
//   });
// });

// app.get("/files/:filename", (req, res) => {
//     fs.readFile(`files/${req.params.filename}`, "utf-8", (err, data)=> {
//         if(err) throw err
//         res.render("detail", {name:req.params.filename, data});
//     })
//   });

// app.get("/edit/:filesname", (req, res) => {
//         res.render("edit",{filesname:req.params.filesname});
//     })

// app.post("/edit", (req, res) => {
//   const {oldName, newName} = req.body;
//     fs.rename(`files/${oldName}`, `files/${newName}`, (err)=> {
//         if(err) throw err
//         res.redirect("/");
//     })
//   });

// app.get("/delete/:filename", (req, res) => {
//     fs.unlink(`files/${req.params.filename}`, (err)=> {
//         if(err) throw err
//         res.redirect("/");
//     })
//   });

app.listen(PORT, () => {
  console.log(`Server is running in the ${PORT}`);
});
