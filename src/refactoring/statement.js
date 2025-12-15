import invoices from "./invoices.json";
import plays from "./plays.json";

function statement(invoice, plays) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);

  function enrichPerformance(performance) {
    const result = { ...performance };
    result.play = playFor(performance);
    result.amount = amountFor(result);
    result.volumeCredits = volumeCreditsFor(result);

    return result;
  }

  function playFor(performance) {
    return plays[performance.playID];
  }

  function amountFor(performance) {
    let result = 0;

    switch (performance.play.type) {
      case "tragedy":
        result = 40000;

        if (performance.audience > 30) {
          result += 1000 * (performance.audience - 30);
        }

        break;

      case "comedy":
        result = 30000;

        if (performance.audience > 20) {
          result += 10000 + 500 * (performance.audience - 20);
        }

        result += 300 * performance.audience;

        break;

      default:
        throw new Error(`unknown type: ${performance.play.type}`);
    }

    return result;
  }

  function volumeCreditsFor(performance) {
    let result = 0;

    // add volume credits
    result += Math.max(performance.audience - 30, 0);

    // add extra credit for every ten comedy attendees
    if ("comedy" === performance.play.type) {
      result += Math.floor(performance.audience / 5);
    }

    return result;
  }

  function totalAmount(data) {
    let result = 0;

    for (let perf of data.performances) {
      result += perf.amount;
    }

    return result;
  }

  function totalVolumeCredits(data) {
    let result = 0;

    for (let perf of data.performances) {
      result += perf.volumeCredits;
    }
    return result;
  }

  return renderPlainText(statementData);
}

export function renderPlainText(data) {
  let result = `Statement for ${data.customer}\n`;

  for (let perf of data.performances) {
    // print line for this order
    result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience} seats)\n`;
  }

  result += `Amount owed is ${usd(data.totalAmount)}\n`;
  result += `You earned ${data.totalVolumeCredits} credits\n`;

  return result;

  function usd(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount / 100);
  }
}

console.log(statement(invoices[0], plays));
