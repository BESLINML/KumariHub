const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { camelize } = require('../utils/records');
const authenticateAdmin = require('../utils/adminAuth');
router.get('/', async (_req,res)=>{try{res.json((await pool.query('SELECT * FROM categories ORDER BY "createdAt" DESC')).rows.map(camelize));}catch(e){res.status(500).json({error:e.message});}});
router.post('/add', authenticateAdmin,async(req,res)=>{try{const {name,img=''}=req.body;if(!name)return res.status(400).json({error:'Name is required'});if((await pool.query('SELECT 1 FROM categories WHERE name ILIKE $1',[name])).rowCount)return res.status(400).json({message:'Category already exists!'});const row=(await pool.query('INSERT INTO categories(name,img) VALUES($1,$2) RETURNING *',[name.trim(),img])).rows[0];res.status(201).json({message:'Category added successfully!',newCategory:camelize(row)});}catch(e){res.status(500).json({error:e.message});}});
router.delete('/:name', authenticateAdmin,async(req,res)=>{try{const r=await pool.query('DELETE FROM categories WHERE name ILIKE $1 RETURNING id',[req.params.name]);if(!r.rowCount)return res.status(404).json({message:'Category not found!'});res.json({message:'Category deleted successfully!'});}catch(e){res.status(500).json({error:e.message});}});
module.exports=router;
