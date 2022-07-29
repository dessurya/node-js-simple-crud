const express = require("express")
const mysql = require("mysql")
const bodyParser = require('body-parser')
const dbConfg = require("./static/json/conn.json")

const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set("view engine","ejs")
app.set("views","views")

const connMain = mysql.createConnection({
    host: dbConfg.mysql.inventory.host,
    database: dbConfg.mysql.inventory.database,
    user: dbConfg.mysql.inventory.user,
    password: dbConfg.mysql.inventory.password,
})

connMain.connect((err) => {
    if (err) throw err
    app.get("/", (req,res) => {
        let title = "Try Select Data"
        res.render("index", {title})
    })

    app.get("/call-list", (req,res) => {
        connMain.query("SELECT * FROM damage_report_eksternal_doc ORDER BY id_damage_eksternal_doc DESC", (err, result, fields) => {
            if (err) throw {err,"res":false}
            let datas = JSON.parse(JSON.stringify(result))
            res.send(datas)
        })
    })

    app.get("/open-data/:id_damage_eksternal_doc", (req,res) => {
        const str_query = "SELECT * FROM damage_report_eksternal_doc WHERE id_damage_eksternal_doc = "+req.params.id_damage_eksternal_doc
        connMain.query(str_query, (err, result, fields) => {
            if (err) throw {err,"res":false}
            let datas = JSON.parse(JSON.stringify(result))
            if (datas.length == 0) throw {"res":false,"msg":"data not found!"}
            res.send({"res":true,"msg":"Found!","data":datas[0]})
        })
    })

    app.delete("/delete-data/:id_damage_eksternal_doc", (req,res) => {
        const str_query = "DELETE FROM damage_report_eksternal_doc WHERE id_damage_eksternal_doc = "+req.params.id_damage_eksternal_doc
        connMain.query(str_query, (err, result, fields) => {
            if (err) throw {err,"res":false}
            let datas = JSON.parse(JSON.stringify(result))
            if (datas.length == 0) throw {"res":false,"msg":"data not found!"}
            res.send({"res":true,"msg":"Success delete data!"})
        })
    })

    app.post("/store", (req,res) => {
        const input = req.body
        let str_query = "UPDATE damage_report_eksternal_doc SET kode = '"+input.kode+"', tipe = '"+input.tipe+"' WHERE id_damage_eksternal_doc = "+input.id_damage_eksternal_doc
        if (input.id_damage_eksternal_doc == undefined || input.id_damage_eksternal_doc == null || input.id_damage_eksternal_doc == '') {
            str_query = "INSERT INTO damage_report_eksternal_doc (`tgl_request`, `kode`, `tipe`) VALUES (NOW(),'"+input.kode+"','"+input.tipe+"')"
        }
        connMain.query(str_query, (err, result, fields) => {
            if (err) throw {err,"res":false,"msg":"gagal melakukan insert data!"}
            let response = {input}
            response.res = true
            response.id_damage_eksternal_doc = input.id_damage_eksternal_doc
            response.msg = "berhasil melakukan update data!"
            if (input.id_damage_eksternal_doc == undefined || input.id_damage_eksternal_doc == null || input.id_damage_eksternal_doc == '') {
                response.msg = "berhasil melakukan insert data!"
                response.id_damage_eksternal_doc = result.insertId
            }
            res.send(response)
        })
    })
})

app.listen(8000, () => {
    console.log("run server...")
})