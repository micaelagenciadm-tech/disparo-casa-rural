const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");

const TOKEN = "SEU_TOKEN_DO_FACEBOOK_AQUI";
const PHONE_NUMBER_ID = "SEU_PHONE_NUMBER_ID_AQUI";
const MAX_DISPAROS = 500;

const contatos = [];
const jaEnviados = new Set();

if (fs.existsSync("enviados.csv")) {
  fs.createReadStream("enviados.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (row.telefone) jaEnviados.add(row.telefone);
    })
    .on("end", iniciar);
} else {
  iniciar();
}

function iniciar() {
  fs.createReadStream("contacts.csv")
    .pipe(csv())
    .on("data", (row) => {
      if (row.telefone && !jaEnviados.has(row.telefone)) {
        contatos.push(row.telefone);
      }
    })
    .on("end", () => {
      const fila = contatos.slice(0, MAX_DISPAROS);

      fila.forEach(async (numero) => {
        try {
          await axios.post(
            `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            {
              messaging_product: "whatsapp",
              to: numero,
              type: "template",
              template: {
                name: "feirao_pisos",
                language: { code: "pt_BR" },
              },
            },
            {
              headers: {
                Authorization: `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(`✅ Enviado para ${numero}`);
          fs.appendFileSync("enviados.csv", `${numero}\n`);
        } catch (error) {
          console.error(`❌ Erro para ${numero}:`, error.response?.data || error.message);
        }
      });
    });
}
