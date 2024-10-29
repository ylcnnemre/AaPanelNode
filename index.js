const express = require("express")
const app = express()
const path = require("path")
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {

    res.send({
        msg: "test mesaj"
    })
})


app.get("/test",(req,res)=>{

    res.json({
        data : "test endpoint"
    })
})

app.listen(4242,()=>{
    console.log("server is running")
})