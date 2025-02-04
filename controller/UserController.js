import express from 'express'
import USER from '../model/userModel.js'
import WORKERS from '../model/workermodel.js';
import bcrypt from 'bcrypt'
import jsonwebtoken from 'jsonwebtoken'
import { cloudinaryInstance } from '../config/clooudinary.js';
import { configDotenv } from 'dotenv';
import { Pics } from '../model/image.js';

const user = async (req, res) => {

  console.log(req.body);
  const { Name, Place, Mobile, Msg, Work } = req.body
  try {
    const data = new USER({
      Name: Name, Place: Place, Message: Msg, Mobile: Mobile, Work: Work
    })
    await data.save()
    return res.status(200).json(`Hello ${Name.toUpperCase()}, we will contact soon`)
  } catch (error) {
    console.log(error);

    return res(500).json('internal server error')
  }
}

const login = async (req, res) => {
  console.log(req.body);

  const { UserName, Password } = req.body
  try {
    const user = await WORKERS.findOne({ FullName: req.body.UserName })
    if (user) {
      console.log(user);
      const PasswordCheck = await bcrypt.compare(Password, user.Password)
      if (PasswordCheck) {
        user.Password = null
        const token = jsonwebtoken.sign({ user: user }, process.env.jwt_secret_key)
        console.log(token);

        return res.status(200).json({ token: token })
      } else {
        console.log('invalid Password');
        return res.status(401).json('Invalid Password')
      }

    } else {
      console.log('not exist');
      return res.status(404).json(`${UserName} is not registered`)
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json('Internal server error');
  }
}

const signup = async (req, res) => {
  console.log(req.body);

  const { FullName, Mobile, Place, Job, SetPassword } = req.body
  try {
    const exist = await WORKERS.find({ Mobile: Mobile })
    console.log(exist);

    if (exist.length > 0) {
      return res.status(409).json(`${Mobile} is already registered`)

    }
    const saltRound = 10
    const hashedPassword = await bcrypt.hash(SetPassword, saltRound)
    console.log(hashedPassword);
    const data = new WORKERS({ FullName: FullName, Mobile: Mobile, Place: Place, Job: Job, Password: hashedPassword })
    await data.save()
    return res.status(201).json(`Your FullName is your UserName: ${FullName}`)
  } catch (error) {
    return res.status(500).json('internal server error')
  }
}

const getMsg = async (req, res) => {
  try {
    const data = await USER.find()
    if (data) {
      console.log(data.length);
      return res.status(200).json({ data: data })
    } else {
      console.log('no data');
      return res.status(404).json('no message')
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json('internal server error')

  }
}

const contactUpdate = async (req, res) => {
  console.log(req.params.id);
  const id = req.params.id

  try {
    const update = await USER.findByIdAndUpdate(id,
      [{ $set: { Connect: { $not: "$Connect" } } }], // Use MongoDB's aggregation pipeline to toggle
      { new: true } // Return the updated document
    );
    console.log(update);

    return res.status(200).json('updated')
  } catch (error) {
    console.log(error);
    return res.status(500).json('internal server error')

  }
}

const deleteMsg = async (req, res) => {
  console.log(req.params.id);

  try {
    const deleting = await USER.findByIdAndDelete(req.params.id)
    console.log(deleting);
    return res.status(200).json('deleted successfully')

  } catch (error) {
    console.log(error);
    return res.status(500).json('internal server error')

  }
}

const contracted = async (req, res) => {
  console.log('contract');

  try {
    const data = await USER.find({ Connect: true });

    if (data.length > 0) {
      // Aggregation to count each type of work
      const workCounts = await USER.aggregate([
        { $match: { Connect: true } }, // Match connected users
        { $group: { _id: "$Work", count: { $sum: 1 } } } // Group by "Work" and count
      ]);

      // Transform aggregation results into a usable format
      console.log(workCounts);


      let counts = workCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {});
      const total = data.length; // Avoid redundant query
      counts.total = total;

      console.log(counts);

      console.log(total);

      counts = {
        Tile: counts.Tile,
        Cement: counts["Cement Plastering"],
        Putty: counts["Putty Plastering"],
        Plumbing: counts["Plumbing"],
        Carpentry: counts["Carpentry"],
        Wiring: counts["Electrical Wiring"],
        Total: counts["total"],
        Paint: counts["Paint"]
      }
      console.log(counts);

      return res.status(200).json({
        total: data.length,
        counts
      });
    } else {
      console.log('no data');
      return res.status(404).json({ message: 'No data found' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const work = async (req, res) => {
  console.log(req.params);
  const { work } = req.params
  try {
    const data = await USER.find({ Work: work })
    console.log(data);
    return res.status(200).json({ data: data })
  } catch (error) {
    console.log(error);
    return res.status(500).json('internal server error')

  }
}

const updateComplete = async (req, res) => {
  const id = req.params.id
  console.log('updateComplete');

  try {
    const update = await USER.findByIdAndUpdate(id, [{ $set: { Completed: { $not: ["$Completed"] } } }], { new: true })
    console.log(update);

    return res.status(200).json('updated')
  } catch (error) {
    console.log(error);

  }
}

const updateContract = async (req, res) => {
  const id = req.params.id
  console.log(id);

  try {
    console.log('updateContract');
    const update = await USER.findByIdAndUpdate(id, [{ $set: { Contracted: { $not: ["$Contracted"] } } }], { new: true })
    console.log(update);

    return res.status(200).json('updated')
  } catch (error) {
    console.log(error);

  }
}

const workers = async (req, res) => {
  console.log('Fetching workers data...');

  try {
    // Aggregate workers data, excluding admins
    const data = await WORKERS.aggregate([
      { $match: { Admin: false } },
      { $group: { _id: "$Job", count: { $sum: 1 } } },
    ]);

    console.log('Raw aggregation data:', data);

    // Transform into readable format (if needed)
    const counts = data.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});
    console.log(counts, "gggggg");

    const jobCounts = {
      Cement: counts["Cement Plaster"] || 0,
      Putty: counts["Putty Plastering"] || 0,
      Plumber: counts["Plumber"] || 0,
      Carpenter: counts["Carpenter"] || 0,
      Electrician: counts["Electrician"] || 0,
      Tile: counts['Tiler'] || 0
    };

    console.log('Formatted counts:', jobCounts);

    // Respond with the aggregated data
    return res.status(200).json({
      jobCounts,
    });
  } catch (error) {
    console.error('Error fetching workers data:', error);
    return res.status(500).json({ error: 'Failed to fetch workers data' });
  }
};

const workersJob = async (req, res) => {
  const work = req.params.work
  console.log(work);
  try {
    const list = await WORKERS.find({ Job: work })
    console.log(list);
    console.log(list.length);

    return res.status(200).json(list)
  } catch (error) {
    console.log(error);
    return res.status(500).josn('internal servwer error')
  }
}

const addImage = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.files);
    const { work, place } = req.body
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const folderName = "Construction";
    const uploadResults = [];

    for (const file of req.files) {
      const uploadedFile = await cloudinaryInstance.uploader.upload(file.path, {
        public_id: `${folderName}/${file.originalname}`
      });
      uploadResults.push(uploadedFile.secure_url);
    }
    console.log(uploadResults);

    const data = new Pics({ work: work, place: place, pics: uploadResults })
    await data.save()

    return res.status(200).json({
      message: "Images uploaded successfully",
    });

  } catch (error) {
    console.error("Upload Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getImage = async (req, res) => {
  try {
    const pics = await Pics.find()
    console.log(pics);
    return res.status(200).json(pics)
  } catch (error) {
    console.log(error);
    return res.status(500).json('internal server error')

  }
}

// const deletePic = async (req, res) => {

//   const extractPublicId = (url) => {
//     console.log('url', url);

//     try {
//       // Extract the part of the URL after "upload/"
//       const parts = url.split('/upload/');
//       console.log('parts', parts);

//       // Remove the version part and get the public ID with extension
//       const publicIdWithExtension = parts[1].replace(/^v\d+\//, ''); // Remove "v1725291251/"
//       console.log("publicIdWithExtension", publicIdWithExtension)
//       // Remove the file extension (e.g., ".jpg") and decode URL
//       const publicId = decodeURIComponent(publicIdWithExtension.split('.')[0]);
//       console.log('public', publicId);

//       return publicId;
//     } catch (error) {
//       console.error(`Failed to extract public ID from URL: ${url}`, error);
//       return null;
//     }
//   };
//   console.log(req.params.id);
//   const id = req.params.id
//   try {
//     const results = await Pics.findById(id)
//     const pics = results.pics;
//     console.log('Fetched pics:', pics);

//     const picsIds = [];
//     if (pics && pics.length > 0) {
//       await Promise.all(
//         pics.map(async (file) => {
//           const publicId = extractPublicId(file);
//           if (publicId) {
//             picsIds.push(publicId);
//           }
//         })
//       );
//       console.log(picsIds);

//       const deleteResults = await Promise.all(
//         picsIds.map(async (publicId) => {
//           try {
//             const result = await cloudinaryInstance.uploader.destroy(publicId);
//             console.log("Deletion result for", publicId, ":", result);
//             return { publicId, ...result };
//           } catch (error) {
//             console.error(`Error deleting ${publicId}:`, error);
//             return { publicId, error: error.message };
//           }
//         })
//       );
//       console.log(deleteResults);

//     }
//   } catch (error) {
//     console.log(error);

//   }
// }

const deletePic = async (req, res) => {
  const extractPublicId = (url) => {
    console.log('url:', url);

    try {
      const parts = url.split('/upload/');
      console.log('parts', parts);

      if (parts.length < 2) return null;

      let publicIdWithExtension = parts[1].replace(/^v\d+\//, '');
      console.log("publicIdWithExtension:", publicIdWithExtension);

      const publicId = decodeURIComponent(publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.')));
      console.log('Extracted publicId:', publicId);

      return publicId;
    } catch (error) {
      console.error(`Failed to extract public ID from URL: ${url}`, error);
      return null;
    }
  };

  console.log('Request ID:', req.params.id);
  const id = req.params.id;

  try {
    const results = await Pics.findById(id);
    if (!results) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const pics = results.pics;
    console.log('Fetched pics:', pics);

    const picsIds = [];
    if (pics && pics.length > 0) {
      await Promise.all(
        pics.map(async (file) => {
          const publicId = extractPublicId(file);
          if (publicId) {
            picsIds.push(publicId);
          }
        })
      );
    }

    console.log('Extracted Public IDs:', picsIds);

    const deleteResults = await Promise.all(
      picsIds.map(async (publicId) => {
        try {
          const result = await cloudinaryInstance.uploader.destroy(publicId, {
            invalidate: true,
            resource_type: "image"
          });
          console.log("Deletion result for", publicId, ":", result);
          return { publicId, ...result };
        } catch (error) {
          console.error(`Error deleting ${publicId}:`, error);
          return { publicId, error: error.message };
        }
      })
    );
    const deleteDocument = await Pics.findByIdAndDelete(id)
    console.log(deleteDocument);
    
    console.log("Final deletion results:", deleteResults);
    res.json({ success: true, deleted: deleteResults });

  } catch (error) {
    console.error("Error fetching image data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export {
  user, login, signup, getMsg, contactUpdate, deleteMsg, addImage,
  contracted, work, updateContract, updateComplete, workers, workersJob, getImage, deletePic
}                      