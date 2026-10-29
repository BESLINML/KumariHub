const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { camelize } = require('../utils/records');
const authenticateAdmin = require('../utils/adminAuth');
router.use(authenticateAdmin);
router.get('/dashboard-stats',async(req,res)=>{try{const params=[];let where='';if(req.query.startDate&&req.query.endDate){params.push(req.query.startDate,new Date(new Date(req.query.endDate).setHours(23,59,59,999)));where='WHERE "createdAt">=$1 AND "createdAt"<=$2';}const all=(await pool.query(`SELECT * FROM businesses ${where}`,params)).rows.map(camelize);const now=new Date(),today=new Date();today.setHours(0,0,0,0);const nextWeek=new Date(today);nextWeek.setDate(nextWeek.getDate()+7);nextWeek.setHours(23,59,59,999);const activePremium=all.filter(b=>b.premium&&b.status==='active');res.json({totalBusinesses:all.length,todaysListings:all.filter(b=>new Date(b.createdAt)>=today).length,upcomingRenewals:all.filter(b=>b.status==='active'&&new Date(b.expiryDate)>=today&&new Date(b.expiryDate)<=nextWeek),expiredListings:all.filter(b=>b.status==='expired'||new Date(b.expiryDate)<now),inactiveListings:all.filter(b=>b.status==='inactive').length,categories:Number((await pool.query('SELECT COUNT(*) FROM categories')).rows[0].count),locations:Number((await pool.query('SELECT COUNT(*) FROM locations')).rows[0].count),revenue:activePremium.reduce((sum,b)=>sum+(b.price||500),0),premiumList:all.filter(b=>b.premium),nonPremiumList:all.filter(b=>!b.premium)});}catch(e){res.status(500).json({error:e.message});}});
module.exports=router;
