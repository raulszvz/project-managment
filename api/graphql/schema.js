const graphql = require("graphql");
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require("bcryptjs");

//create a database if no exists
const database = new sqlite3.Database("./db/pm.db");

//create a table to insert post
const createUsuarioTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS usuario(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre text,
        email text,
        password text,
        tipo text)`;

    return database.run(query);
}

const createProyectoTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS proyecto(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo text,
        tipo text,
        descripcion text,
        modelo text, 
        fechaAsignacion text,
        fechaFinal text,
        idUsuario integer,
        FOREIGN KEY(idUsuario) REFERENCES usuario(id))`;

    return database.run(query);
}

const createEntregaTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS entrega(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numEntrega integer,
            fechaEntrega text,
            descripcion text,
            observaciones text,
            fechaRevision text,
            idProyecto integer,
            FOREIGN KEY(idProyecto) REFERENCES proyecto(id))`;

    return database.run(query);
}

//call function to init the post table
createUsuarioTable();
createProyectoTable();
createEntregaTable();

// Metodos criptograficos para password
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, passwordDB) => {
    const valid = await bcrypt.compare(password, passwordDB);
    return valid;
}

//creacte graphql post object
const UsuarioType = new graphql.GraphQLObjectType({
    name: 'Usuario',
    fields:{
        id:{ type: graphql.GraphQLID },
        nombre: { type: graphql.GraphQLString },
        email: { type: graphql.GraphQLString },
        password: { type: graphql.GraphQLString },
        tipo: { type: graphql.GraphQLString },
    }
});

const ProyectoType = new graphql.GraphQLObjectType({
    name: 'Proyecto',
    fields:{
        id: { type: graphql.GraphQLID },
        titulo: { type: graphql.GraphQLString },
        tipo: { type: graphql.GraphQLString }, 
        descripcion: { type: graphql.GraphQLString }, 
        modelo: { type: graphql.GraphQLString }, 
        fechaAsignacion: { type: graphql.GraphQLString }, 
        fechaFinal: { type: graphql.GraphQLString },
        idUsuario: { type: graphql.GraphQLInt }
    }
});

const EntregaType = new graphql.GraphQLObjectType({
    name: 'Entrega',
    fields:{
        id: { type: graphql.GraphQLID },
        numEntrega: { type: graphql.GraphQLInt },
        fechaEntrega: { type: graphql.GraphQLString }, 
        descripcion: { type: graphql.GraphQLString }, 
        observaciones: { type: graphql.GraphQLString }, 
        fechaRevision: { type: graphql.GraphQLString }, 
        idProyecto: { type: graphql.GraphQLInt }
    }
});

// create a graphql query to select all and by id
var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        Login: {
            type: UsuarioType,
            args: {
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                }
            }, 
            resolve:  (root, {email,password}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM usuario WHERE email = (?);", [email],  async (err,row) => {
                        if(err || !(await comparePassword(password, row[0]["password"]))){
                            reject(null);
                        } 
                        resolve(row[0]);
                    });
                });
            }
        },
        Usuarios: {
            type: graphql.GraphQLList(UsuarioType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    database.all("SELECT * FROM usuario;", function(err,rows){
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        ProyectosUsuario: {
            type: graphql.GraphQLList(ProyectoType),
            args: {
                idUsuario: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {idUsuario}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM proyecto WHERE idUsuario = (?);", [idUsuario], function(err,rows) {
                       if(err){
                           reject([]);
                       } 
                       resolve(rows);
                    });
                });
            }
        },
        Proyectos: {
            type: graphql.GraphQLList(ProyectoType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    database.all("SELECT * FROM proyecto;", function(err,rows){
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                    });
                });
            }
        },
        Proyecto: {
            type: ProyectoType,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM proyecto WHERE id = (?);", [id], function(err,rows) {
                       if(err){
                           reject(null);
                       } 
                       resolve(rows[0]);
                    });
                });
            }
        },
        Entregas: {
            type: graphql.GraphQLList(EntregaType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    database.all("SELECT * FROM entrega;", function(err,rows){
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                        console.log(rows);
                    });
                });
            }
        },
        Entrega: {
            type: EntregaType,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM entrega WHERE id = (?);", [id], function(err,rows) {
                       if(err){
                           reject(null);
                       } 
                       resolve(rows[0]);
                    });
                });
            }
        },
        EntregasDeProyecto: {
            type: graphql.GraphQLList(EntregaType),
            args: {
                idProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {idProyecto}, context, info) => {
                return new Promise((resolve, reject) =>{
                    database.all("SELECT * FROM entrega WHERE idProyecto = (?);", [idProyecto], function(err,rows) {
                       if(err){
                           reject([]);
                       } 
                       resolve(rows);
                    });
                });
            }
        }
    }
});

//mutation type is a type of object to modify data (INSERT,DELETE,UPDATE)
var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        //Mutations Usuario
        createUsuario: {
            type: UsuarioType,
            args: {
                nombre: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
            },
            resolve: async (root, {nombre, email, password, tipo}) => {
                let pass = await encryptPassword(password)
                return new Promise((resolve, reject) =>{
                    database.run('INSERT INTO usuario (nombre, email, password, tipo) VALUES (?,?,?,?);', [nombre, email, pass, tipo], (err) => {
                        if(err){
                            reject(null);
                        }
                        database.get('SELECT last_insert_rowid() as id', (err, row) => {
                            resolve({
                                id: row["id"],
                                nombre: nombre,
                                email: email, 
                                password: pass,
                                tipo: tipo
                            })
                        });
                    });
                });
            }
        },
        updateUsuario: {
            type: graphql.GraphQLString,
            args: {
                nombre: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                email: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                password: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
            },
            resolve: (root, {nombre, email, password, tipo}) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to update a post in post table
                    database.run('UPDATE usuario SET nombre = (?), email = (?), password = (?), tipo = (?) WHERE id = (?);', [id, nombre, email, password, tipo], (err) => {
                        if(err) {
                            reject(err);
                        }
                        resolve(`Usuario #${id} updated`);
                    });
                })
            }
        },
        deleteUsuario: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}) => {
                return new Promise((resolve, reject) => {
                    database.run('DELETE FROM usuario WHERE id = (?);', [id], (err) => {
                        if(err){
                            reject(err);
                        }
                        resolve(`Usuario #${id} deleted`)
                    });
                });
            }
        },
        // Mutations Proyecto
        createProyecto: {
            type: ProyectoType,
            args: {
                titulo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                descripcion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                modelo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaAsignacion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaFinal: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idUsuario:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
            },
            resolve: (root, {titulo, tipo, descripcion, modelo, fechaAsignacion, fechaFinal, idUsuario}) => {
                return new Promise((resolve, reject) =>{
                    database.run('INSERT INTO proyecto (titulo, tipo, descripcion, modelo, fechaAsignacion, fechaFinal, idUsuario) VALUES (?,?,?,?,?,?,?);', [titulo, tipo, descripcion, modelo, fechaAsignacion, fechaFinal, idUsuario], (err) => {
                        if(err){
                            reject(null);
                        }
                        database.get('SELECT last_insert_rowid() as id', (err, row) => {
                            resolve({
                                id: row["id"],
                                titulo: titulo, 
                                tipo: tipo, 
                                descripcion: descripcion, 
                                modelo: modelo,
                                fechaAsignacion: fechaAsignacion, 
                                fechaFinal: fechaFinal,
                                idUsuario: idUsuario
                            })
                        });
                    });
                });
            }
        },
        updateProyecto: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                },
                titulo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                tipo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                descripcion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                modelo: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaAsignacion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaFinal: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idUsuario: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {id, titulo, tipo, descripcion, modelo, fechaAsignacion, fechaFinal, idUsuario}) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to update a post in post table
                    database.run('UPDATE proyecto SET titulo = (?), tipo = (?), descripcion = (?), modelo = (?), fechaAsignacion = (?), fechaFinal = (?), idUsuario = (?) WHERE id = (?);', [id, titulo, tipo, descripcion, modelo, fechaAsignacion, fechaFinal, idUsuario], (err) => {
                        if(err) {
                            reject(err);
                        }
                        resolve(`Proyecto #${id} updated`);
                    });
                })
            }
        },
        deleteProyecto: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}) => {
                return new Promise((resolve, reject) => {
                    database.run('DELETE FROM proyecto WHERE id = (?);', [id], (err) => {
                        if(err){
                            reject(err);
                        }
                        resolve(`Proyecto #${id} deleted`)
                    });
                });
            }
        },
        // Mutations Entrega
        createEntrega: {
            type: EntregaType,
            args: {
                numEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
                fechaEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                descripcion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                observaciones: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaRevision: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {numEntrega, fechaEntrega, descripcion, observaciones, fechaRevision, idProyecto}) => {
                return new Promise((resolve, reject) =>{
                    database.run('INSERT INTO entrega (numEntrega, fechaEntrega, descripcion, observaciones, fechaRevision, idProyecto) VALUES (?,?,?,?,?,?);', [numEntrega, fechaEntrega, descripcion, observaciones, fechaRevision, idProyecto], (err) => {
                        if(err){
                            reject(null);
                        }
                        database.get('SELECT last_insert_rowid() as id', (err, row) => {
                            resolve({
                                id: row["id"],
                                numEntrega: numEntrega, 
                                fechaEntrega: fechaEntrega, 
                                descripcion: descripcion, 
                                observaciones: observaciones, 
                                fechaRevision: fechaRevision,
                                idProyecto: idProyecto
                            })
                        });
                    });
                });
            }
        },
        updateEntrega: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                },
                numEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                },
                fechaEntrega: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                descripcion: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                observaciones: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                fechaRevision: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                idProyecto: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
                }
            },
            resolve: (root, {id, numEntrega, fechaEntrega, descripcion, observaciones, fechaRevision, idProyecto}) => {
                return new Promise((resolve, reject) => {
                    //raw SQLite to update a post in post table
                    database.run('UPDATE entrega SET numEntrega = (?), fechaEntrega = (?), descripcion = (?), observaciones = (?), fechaRevision = (?), idProyecto = (?) WHERE id = (?);', [id, numEntrega, fechaEntrega, descripcion, observaciones, fechaRevision, idProyecto], (err) => {
                        if(err) {
                            reject(err);
                        }
                        resolve(`Entrega #${id} updated`);
                    });
                })
            }
        },
        deleteEntrega: {
            type: graphql.GraphQLString,
            args: {
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {id}) => {
                return new Promise((resolve, reject) => {
                    database.run('DELETE FROM entrega WHERE id = (?);', [id], (err) => {
                        if(err){
                            reject(err);
                        }
                        resolve(`Entrega #${id} deleted`)
                    });
                });
            }
        }
    }
});

//define schema with post object, queries, and mustation 
const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType 
});

//export schema to use on index.js
module.exports = {
    schema
}