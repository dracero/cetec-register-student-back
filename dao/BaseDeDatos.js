var student = require("../models/student.js");

class ErrorNameAlreadyExists extends Error {
    
    constructor() {
        
        super();
        this.name = 'Error: ya existe una estructura con el mismo nombre.';
        Error.captureStackTrace(this, this.constructor);
    }
}

class ErrorStudentAlreadyExists extends Error {
    
    constructor() {
        
        super();
        this.name = 'Error: ya existe una estudiante con el mismo nombre.';
        Error.captureStackTrace(this, this.constructor);
    }
}

class ErrorFieldIsEmpty extends Error {
    
    constructor(field) {
        
        super();
        this.name = 'Error: no se ha ingresado ' + field + '.';
        Error.captureStackTrace(this, this.constructor);
    }
}

class ErrorIdDoesNotExist extends Error {
    
    constructor(id) {
        
        super();
        this.name = "Error: la ID no existe.";
        Error.captureStackTrace(this, this.constructor);
    }
}

class BaseDeDatos {

    constructor(){
        this.studentModel = student;
    }

    async student_email_exists(email) {

        return this.studentModel.findOne({ email: email})
            .select("email")
            .lean()
            .then(result => {
                return result != null;
            });
    }

    async add_student(email, name, date, image) {

        if (await this.student_email_exists(email)) {
            /*
            console.log("Alumno ya cargado previamente, se actualizarán los datos.");
            return this.edit_student(email, name, date, image);
            */
            console.log("Alumno ya cargado previamente.");
            throw new ErrorStudentAlreadyExists();
        }

        console.log("Alumno nuevo, se agrega a la lista.");
        const obj = JSON.stringify({email: email, name: name, date: date, image:image});
        const student_structure = new this.studentModel(JSON.parse(obj));
        student_structure.save();
        return student_structure;
    }

    async edit_student(email, name, date, image) {

        try {            
            if(email === '') {email = null;}
            if(name === '') {name = null;}
            if(date === '') {date = null;}
            if(image === '') {image = null;}

            let email_is_empty = (email === null);
            let name_is_empty = (name === null);
            let date_is_empty = (date === null);
            let image_is_empty = (image === null);


            if (email_is_empty) {
                console.log("Error: email vacío.");
                throw new ErrorFieldIsEmpty("email");
            }

            if (name_is_empty) {
                console.log("Error: nombre vacío.");
                throw new ErrorFieldIsEmpty("name");
            }

            if (date_is_empty) {
                console.log("Error: fecha vacía.");
                throw new ErrorFieldIsEmpty("date");
            }
           
            if (image_is_empty) {
                console.log("Error: imagen vacía.");
                throw new ErrorFieldIsEmpty("image");
            }

            const obj = JSON.stringify({email: email, name: name, date: date, image:image});
            let student_structure = new this.studentModel(JSON.parse(obj));

            await this.studentModel.findByIdAndUpdate(id, JSON.parse(obj), {new: true},  function (err, student_structure) {
                if (err){
                    console.log("Error: " + err.toString());
                } else{
                    console.log("ID del usuario actualizado: ", id);
                }
            }).clone();
            return student_structure;
        } catch (e){
            throw e;
        }
    }
}

module.exports = BaseDeDatos;
