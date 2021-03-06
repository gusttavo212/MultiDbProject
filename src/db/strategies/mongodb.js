const ICrud = require("./interfaces/interfaceCrud");
const mongoose = require("mongoose");
const STATUS = {
  0: "Disconectado",
  1: "Conectado",
  2: "Conectando",
  3: "Disconectado"
};

class MongoDB extends ICrud {
  constructor() {
    super();
    this._herois = null;
    this._driver = null;
  }

  async isConnected() {
    const state = STATUS[this._driver.readyState];
    if (state === "Conectado") return state;

    if (state !== "Conectando") return state;

    await new Promise(resolve => setTimeout(resolve, 1000));

    return STATUS[this._driver.readyState];
  }

  defineModel() {
    const heroiSchema = new mongoose.Schema({
      nome: {
        type: String,
        required: true
      },
      poder: {
        type: String,
        required: true
      },
      insertedAt: {
        type: Date,
        default: new Date()
      }
    });

    this._herois = mongoose.model("herois", heroiSchema);//O Schema é o this._herois
  }

  connect() {
    mongoose.connect(
      "mongodb://gadsden:250433@localhost/herois?authSource=admin&w=1",
      { useNewUrlParser: true },
      function(error) {
        if (!error) return;
        console.log("Falha na conexão", error);
      }
    );

    const connection = mongoose.connection;
    this._driver = connection;
    connection.once("open", () => console.log("Database MONGODB CONECTADO"));
    this.defineModel();
  };

  create(item) {
    return this._herois.create(item);    
  };

  read(item, skip=0, limit=10) {//Skip = Seria a pagina
    return this._herois.find(item).skip(skip).limit(limit);
  };

  update(id, item) {
    return this._herois.updateOne({_id: id}, {$set: item})//updateOne é o novo update
  };

  delete(id) {
    return this._herois.deleteOne({_id: id});
  }
}

module.exports = MongoDB;
