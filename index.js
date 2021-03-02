/*
Copyright (C) 2021  Stefan Begerad

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const Helmet = require('helmet');
const Compression = require('compression');
const Debug = require('debug')('gtfs');
const Express = require("express");
const Cors = require("cors");
const App=Express();
App.use(Compression()); //Compress all routes
App.use(Helmet());//protect against vulnerabilities
// restrict origin list
let whitelist = [
    'https://localhost',
    'http://localhost:55555'
];

App.use(Cors({
    origin: function(origin, callback){
        // allow requests with no origin
        Debug('origin: '+origin)
        if(!origin){
            return callback(null, true);
        }
        if(whitelist.indexOf(origin) === -1){
            var message = 'The CORS policy for this origin does not allow access from the particular origin: '+origin;
            return callback(new Error(message), false);
        }
        Debug('origin: '+origin+' allowed by cors');
        return callback(null, true);
    }
}));

const PORT=parseInt(process.env.PORT, 10)||55555;
Debug('PORT: '+PORT)

var server = App.listen(PORT);

//require .js file generated from .proto file
const auth = require('./auth_pb');
//create instance of User message
const authObj = new auth.User();
//set message fields
authObj.setEmail("sbegerad@posteo.de");
authObj.setPassword("01234");
Debug('authObj.getEmail(): '+authObj.getEmail());
//serialize object to binary data
const serializedData = authObj.serializeBinary();
//deserialize binary data to object
const desData = auth.User.deserializeBinary(serializedData);
Debug('desData.getEmail(): '+desData.getEmail());
//convert object to JSON
const jsonData = desData.toObject();
Debug('object as JSON: '+jsonData);

//ALL CRUD HANDLERS HERE
//GET == READ
App.get('/user.pb', (req, res) => {
        res.contentType('application/octet-stream')
        res.send(serializedData);
})

