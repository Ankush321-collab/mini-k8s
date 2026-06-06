import express from 'express';
import {db} from './DB/index.js';
import {jobStateTable} from './DB/Schema.js';


const app=express();
app.use(express.json());
const port=process.env.PORT || 5000;

app.get('/',(req,res)=>{
    res.send('Hello World!');
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});

app.post('/job',async(req,res)=>
{
    const {image,cmd=null}=req.body;
    if(!image)
    {
        return res.status(400).json({error:'Image is required'});
    }
    const [insetresult]=await db.insert(jobStateTable).values({
        image,
        cmd
    }).returning({
        id:jobStateTable.id,
    });
    res.json(insetresult);


});