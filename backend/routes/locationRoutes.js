const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { camelize } = require('../utils/records');
const authenticateAdmin = require('../utils/adminAuth');
router.get('/',async(_req,res)=>{try{res.json((await pool.query('SELECT * FROM locations ORDER BY "createdAt" DESC')).rows.map(camelize));}catch(e){res.status(500).json({error:e.message});}});
router.post('/add', authenticateAdmin,async(req,res)=>{try{const {locationName}=req.body;if(!locationName)return res.status(400).json({error:'Location name is required'});if((await pool.query('SELECT 1 FROM locations WHERE "locationName" ILIKE $1',[locationName])).rowCount)return res.status(400).json({message:'Location already exists!'});const row=(await pool.query('INSERT INTO locations("locationName") VALUES($1) RETURNING *',[locationName.trim()])).rows[0];res.status(201).json({message:'Location added successfully!',newLocation:camelize(row)});}catch(e){res.status(500).json({error:e.message});}});
router.delete('/:name', authenticateAdmin,async(req,res)=>{try{const r=await pool.query('DELETE FROM locations WHERE "locationName" ILIKE $1 RETURNING id',[req.params.name]);if(!r.rowCount)return res.status(404).json({message:'Location not found!'});res.json({message:'Location deleted successfully!'});}catch(e){res.status(500).json({error:e.message});}});
module.exports=router;
