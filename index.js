const Discord = require('discord.js');
const client = new Discord.Client();
const regex = /^\!r\s+(\d*)(\s+\((\d+)\))?(\s+\d*)?$/gm;

function getRandomDigit() {
  return Math.floor(Math.random() * Math.floor(10)) + 1;
}

function getResult(nbDices, nbBloodDices, threshold) {
  let result = {
    bloodDices: [],
    normalDices: [],
    brutalTriumph: false,
    savageEchec: false,
    success: 0,
  }
  for (let i = 0; i < nbDices; i++) {
    let rDigit = getRandomDigit();
    nbBloodDices ? (i < nbBloodDices ? result.bloodDices.push(rDigit) : result.normalDices.push(rDigit)) : result.normalDices.push(rDigit);
  }
  result.bloodDices = result.bloodDices.sort();
  result.normalDices = result.normalDices.sort();
  result = getNBSuccess(result);

  if (threshold) {
    if ((result.bloodDices.filter(x => x === 10).length >= 2 ||
      (result.bloodDices.filter(x => x === 10).length >= 1 && result.normalDices.filter(x => x === 10).length >= 1))
      && result.success >= threshold)
      result.brutalTriumph = true;
    if (result.bloodDices.includes(1) && result.success < threshold)
      result.savageEchec = true;
  } else {
    if (result.bloodDices.filter(x => x === 10).length >= 2 ||
      (result.bloodDices.filter(x => x === 10).length >= 1 && result.normalDices.filter(x => x === 10).length >= 1))
      result.brutalTriumph = true;
    if (result.bloodDices.includes(1))
      result.savageEchec = true;
  }
  return result;
}

function getNBSuccess(result) {
  let allDices = result.bloodDices.concat(result.normalDices);
  result.success = allDices.filter(x => x >= 6 && x < 10).length;
  let nbTenDices = allDices.filter(x => x === 10).length;
  result.success += ~~(nbTenDices / 2) * 4 + nbTenDices % 2;
  return result;
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  switch (msg.content) {
    case "!r help":
      msg.reply(`
      - !r n (s) d
      n => Nombre de dés a lancer (obligatoire)
      s => Nombre de dés de sang (optionel)
      d => Difficulté du jet (optionel)
      `)
      break;
    default:
      if (msg.content.startsWith("!r")) {
        let array = [...msg.content.matchAll(regex)];
        if (array.length) {
          array = array[0];
          let nbDices = parseInt(array[1]);
          let nbBloodDices = array[3] ? parseInt(array[3]) : null;
          let threshold = array[4] ? parseInt(array[4]) : null;
          if (isNaN(nbDices) || isNaN(nbBloodDices) || isNaN(threshold) || nbDices > 100 || nbBloodDices > nbDices || threshold > 100)
            return msg.reply("Calme toi pauve con·ne.")
          if (nbDices < 0 || nbDices === 0)
            return msg.reply("LOL.");

          let result = getResult(nbDices, nbBloodDices, threshold);

          msg.reply(`\`\`\`py
          ${result.bloodDices.length ? `@Dés de sang: ${result.bloodDices}` : ''}
          ${result.normalDices.length ? `Dés normaux: ${result.normalDices}` : ''}
          \`\`\`
          ${result.brutalTriumph ? (threshold ? `Attention triomphe brutal` : 'Attention possible triomphe brutal') : ''}
          ${result.savageEchec ? (threshold ? `Attention echec sauvage` : 'Attention possible echec sauvage') : ''}
          ${threshold ? (result.success >= threshold ? `Vous avez obtenu ${result.success} succès pour une difficulté de  ${threshold}. Vous réussissez avec un écart de ${result.success - threshold}` : `Vous avez obtenu ${result.success} succès pour une difficulté de  ${threshold}. Vous échouez avec un écart de ${threshold - result.success}`) : `Vous avez obtenu ${result.success} succès.`}`);
        } else {
          msg.reply("Parle mieux!");
        }
      }
  }
});

client.login(process.env.TOKEN)
  .catch(e => {
    console.log(e);
  })