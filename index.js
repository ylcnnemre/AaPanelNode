const express = require("express")
const app = express()


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