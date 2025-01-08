import express from 'express'
import USER from '../model/userModel.js'
const user = async (req, res) => {
  console.log('user');

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


export { user }  