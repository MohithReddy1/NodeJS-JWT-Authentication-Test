const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Headers", 'Content-type, Authorization');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const secretKey = 'My super secret key';
const jwtMW = expressJwt.expressjwt({
    secret: secretKey,
    algorithms: ['HS256'],
});

let users = [
    {
        id: 1,
        username: 'mohith',
        password: '123'
    },
    {
        id: 2,
        username: 'vuyyuru',
        password: '456'
    }
];

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let foundUser = null;

    for (let user of users) {
        if (username === user.username && password === user.password) {
            foundUser = user;
            break;
        }
    }

    if (foundUser) {
        let token = jwt.sign({ id: foundUser.id, username: foundUser.username }, secretKey, { expiresIn: '3m' });
        res.json({
            success: true,
            err: null,
            token
        });
    } else {
        res.status(401).json({
            success: false,
            token: null,
            err: 'Username or Password is incorrect'
        });
    }
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    // console.log(req);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'The Price is $3.45'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Settings Page'
    });
});

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: 'Username or password is incorrect 2'
        });
    } else {
        next(err);
    }
});

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});