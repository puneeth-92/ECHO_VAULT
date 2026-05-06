import crypto from 'crypto';
import bcrypt from 'bcrypt';
import File from '../models/File.js';
import Access from '../models/Access.js';
import jwt from 'jsonwebtoken';

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const { password } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const token = crypto.randomBytes(32).toString('hex');

    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const fileDoc = await File.create({
      filename: file.originalname,
      path: file.path,
      size: file.size
    });

    await Access.create({
      token,
      fileId: fileDoc._id,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      maxDownloads: 3,
      passwordHash
    });

    res.json({
      link: `http://localhost:${process.env.PORT}/api/f/${token}`
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const verifyPassword = async (req, res) => {

  try {

    const { token, password } = req.body;

    const access = await Access.findOne({ token });

    if (!access) {
      return res.status(404).json({
        message: 'Invalid link'
      });
    }

    if (!access.passwordHash) {
      return res.status(400).json({
        message: 'This file has no password'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      access.passwordHash
    );

    if (!isMatch) {
      return res.status(403).json({
        message: 'Incorrect password'
      });
    }

    //temporary access JWT
    const accessToken = jwt.sign(
      { token },
      process.env.JWT_SECRET,
      { expiresIn: '10m' }
    );

    res.json({
      accessToken
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: 'Server error'
    });

  }

};

export const getFile = async (req, res) => {
  try {
    const { token } = req.params;

    const access = await Access.findOne({ token });

    if (!access) {
      return res.status(404).send("Invalid link");
    }

    if (new Date() > access.expiryTime) {
      return res.status(403).send("Link expired");
    }

    if (access.currentDownloads >= access.maxDownloads) {
      return res.status(403).send("Download limit reached");
    }

    if (access.passwordHash) {

      const authHeader = req.headers.authorization;
    
      if (!authHeader) {
        return res.status(401).send('Access token required');
      }
    
      const accessToken = authHeader.split(' ')[1];
    
      try {
    
        const decoded = jwt.verify(
          accessToken,
          process.env.JWT_SECRET
        );
    
        if (decoded.token !== token) {
          return res.status(403).send('Invalid access token');
        }
    
      } catch (err) {
        return res.status(403).send('Invalid or expired access token');
      }
    }

    const file = await File.findById(access.fileId);

    if (!file) {
      return res.status(404).send("File not found");
    }

    access.currentDownloads += 1;
    await access.save();

    return res.download(file.path, file.filename);

  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};