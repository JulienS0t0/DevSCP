const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const Intervention = require("../models/Intervention");

let gfsBucket;
mongoose.connection.once("open", () => {
    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
});

const addMedia = async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = gfsBucket.openUploadStream(file.originalname);
    uploadStream.end(file.buffer);

    uploadStream.on("finish", async () => {
        try {
            const intervention = await Intervention.findOne({ interventionId: req.params.interventionId })
            if (!intervention) {
                return res.status(404).json({ message: "Intervention introuvable" });
            }
            intervention.media.push(uploadStream.id);
            await intervention.save();
            res.status(201).json({ message: "File uploaded successfully", fileId: uploadStream.id });
        } catch (err) {
            console.error("Error updating intervention:", err);
            res.status(500).json({ message: "Error updating intervention", error: err.message });
        }
    });

    uploadStream.on("error", (err) => {
        console.error("Error uploading file:", err);
        res.status(500).json({ message: "Error uploading file", error: err.message });
    });
};

const getMedia = async (req, res) => {
    try {
        const { mediaId } = req.params;
        const downloadStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(mediaId));

        downloadStream.on("error", (err) => {
            console.error("Error retrieving file:", err);
            res.status(500).json({ message: "Error retrieving file", error: err.message });
        });

        downloadStream.pipe(res);
    } catch (err) {
        console.error("Error retrieving file:", err);
        res.status(500).json({ message: "Error retrieving file", error: err.message });
    }
};

const deleteMedia = async (req, res) => {
    const { interventionId, mediaId } = req.params;

    try {
        await gfsBucket.delete(new mongoose.Types.ObjectId(mediaId));
        const intervention = await Intervention.findOne({ interventionId: interventionId });
        intervention.media = intervention.media.filter((id) => id.toString() !== mediaId);
        await intervention.save();
        res.status(200).json({ message: "File deleted successfully" });
    } catch (err) {
        console.error("Error deleting file:", err);
        res.status(500).json({ message: "Error deleting file", error: err.message });
    }
};

const getAllMedia = async (req, res) => {
    try {
        const intervention = await Intervention.findOne({ interventionId: req.params.interventionId }).populate("media");
        res.status(200).json({ media: intervention.media });
    } catch (err) {
        console.error("Error retrieving media:", err);
        res.status(500).json({ message: "Error retrieving media", error: err.message });
    }
};

module.exports = {
    addMedia,
    getMedia,
    deleteMedia,
    getAllMedia
};
