import crypto from 'crypto';
import File from '../models/File.js';
import Access from '../models/Access.js';

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // generate secure token
    const token = crypto.randomBytes(32).toString('hex');

    // save file info
    const fileDoc = await File.create({
      filename: file.originalname,
      path: file.path,
      size: file.size
    });

    // save access control
    await Access.create({
      token,
      fileId: fileDoc._id,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxDownloads: 3
    });

    res.json({
      link: `http://localhost:${process.env.PORT}/api/f/${token}`
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getFile = async (req, res) => {
    try {
      const { token } = req.params;
  
      // Find access record
      const access = await Access.findOne({ token });
  
      if (!access) {
        return res.status(404).send("Invalid link");
      }
  
      // Check expiry
      if (new Date() > access.expiryTime) {
        return res.status(403).send("Link expired");
      }
  
      // Check download limit
      if (access.currentDownloads >= access.maxDownloads) {
        return res.status(403).send("Download limit reached");
      }
  
      // Get file
      const file = await File.findById(access.fileId);
  
      if (!file) {
        return res.status(404).send("File not found");
      }
  
      // Increment download count
      access.currentDownloads += 1;
      await access.save();
  
      // Send file
      return res.download(file.path, file.filename);
  
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  };