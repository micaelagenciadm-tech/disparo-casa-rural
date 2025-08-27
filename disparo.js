const axios = require("axios");
const fs = require("fs");
const csv = require("csv-parser");

const TOKEN = "EAAVoN7iNMvsBPfFFZBUbzzW9zx3NX5YVVwAncMB5lIZCW1ZCfcQw5yZCKAhh5NZBBzZAE3LbEiMyjvoxZAJrFydo3lrVHkh2J5XpnZCZCK3pfpunTHlXQdSOmCfiabv1i3dlKYQqWMP4ZA6zIWk3Nn3FNwNc6yGASqhRnbermDhPICfEdZAJMihxXHb6PDfIDgrl9EArQZDZD";
const PHONE_NUMBER_ID = "701518093054354";

const contatos = [];

fs.createReadStream("contacts.csv")
  .pipe(csv())
  .on("data", (row) => {
    if (row.telefone) {
      contatos.push(row.telefone);
    }
  })
  .on("end", () => {
    console.log(`Enviando para ${contatos.length} contatos...`);
    contatos.forEach(async (numero) => {
      try {
        const response = await axios.post(
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
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${numero}`, error.response?.data);
      }
    });
  });
