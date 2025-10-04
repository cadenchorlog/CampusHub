// HTML parsing utilities for extracting balances and transactions

/**
 * Convert HTML string to DOM document
 */
export function toDoc(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html || "", "text/html");
}

/**
 * Check if user is logged in based on document content
 */
export function isLoggedInDoc(doc) {
  const text = (doc?.documentElement?.textContent || "").toLowerCase();
  const looksLoggedIn =
    /account home/i.test(text) ||
    /my accounts/i.test(text) ||
    /recent yote card transaction history/i.test(text);
  const hasNameCell = !!doc?.querySelector("td strong, td b");
  const hasLoginForm = !!doc?.querySelector('form[action*="/ch/login.html"] input[name="username"]');
  console.log("[detect] looksLoggedIn:", looksLoggedIn, "hasLoginForm:", hasLoginForm);
  // Logged in if we see the account home markers and no login form
  return looksLoggedIn && !hasLoginForm && hasNameCell;
}

/**
 * Extract balances from College of Idaho style page
 */
export function extractBalances(doc) {
  console.log("[parse] Extracting balances from College of Idaho style page");
  const getText = el => (el?.textContent || "").trim();
  const money = /-?\$?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/;
  const balances = [];
  // Look for the My Accounts table
  const accountTables = Array.from(doc.querySelectorAll("table")).filter(t =>
    /my accounts/i.test(getText(t))
  );
  for (const table of accountTables) {
    const rows = Array.from(table.querySelectorAll("tr"));
    for (const tr of rows) {
      const cells = Array.from(tr.querySelectorAll("td"));
      if (cells.length >= 4) {
        // Update: Use cells[1] for account name instead of cells[0]
        const accountCell = cells[1];
        const balCell = cells[cells.length - 1];
        const div = balCell.querySelector("div[align=right]");
        if (div) {
          const txt = getText(div);
          const m = txt.match(money);
          if (m) {
            let val = m[0].replace(/\s+/g, "");
            const account = getText(accountCell);
            // If not weekly, ensure dollar sign
            if (!/weekly/i.test(account) && !val.startsWith("$")) val = "$" + val;
            // If weekly, leave val as-is (no dollar sign forced)
            // --- FLEX ZERO SKIP LOGIC START ---
            if (/flex/i.test(account) && /^(\$)?0+(\.00)?$/.test(val)) {
              console.log("[parse] Skipping zero Flex account");
              continue;
            }
            // --- FLEX ZERO SKIP LOGIC END ---
            console.log("[parse] Balance found:", { account, balance: val });
            balances.push({ account, balance: val });
          }
        }
      }
    }
  }
  if (balances.length > 0) {
    return balances;
  }
  // fallback to old logic: try to find a single money value
  console.warn("[parse] Falling back to generic balance detection");
  const bodyText = getText(doc.body);
  const m = bodyText.match(money);
  if (m) {
    let val = m[0];
    // For fallback, always ensure dollar sign since account is unknown
    if (!val.startsWith("$")) val = "$" + val;
    balances.push({ account: "Unknown", balance: val });
    return balances;
  }
  return [];
}

/**
 * Extract transactions from tables
 */
export function extractTransactions(doc, maxRows = 15) {
  console.log("[parse] Extracting transactions from tables");
  const tables = Array.from(doc.querySelectorAll("table"));
  const results = [];

  const normalize = (s) => (s || "").replace(/\u00A0|\xa0/g, " ").replace(/\s+/g, " ").trim();
  const isDetailsRow = (tr) => tr.classList.contains("DetailsRowClass") || /^Details_/i.test(tr.id || "");
  const looksTxnHeader = (tr) => {
    const cells = Array.from(tr.querySelectorAll("td,th")).map((c) => normalize(c.textContent).toLowerCase());
    return cells.some((c) => c.includes("date")) && cells.some((c) => c.includes("amount"));
  };
  const getAmount = (td) => {
    if (!td) return "";
    const el = td.querySelector('div[align="right"], div[align=right]') || td;
    const txt = normalize(el.textContent);
    // Keep only digits, comma, dot, sign for parsing and then extract a number-like token
    const cleaned = txt.replace(/[^0-9,.\-+]/g, "");
    const m = cleaned.match(/[-+]?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|[-+]?\d+(?:\.\d{1,2})?/);
    return m ? m[0] : txt;
  };

  // First pass: handle Yote Card style tables where headers are <td><strong>..</strong></td> and rows have id="EntryRow"
  for (const table of tables) {
    const tableText = normalize(table.textContent).toLowerCase();
    const headerRow = Array.from(table.querySelectorAll("tr")).find(looksTxnHeader);
    const isYoteStyle = tableText.includes("recent yote card transaction history") || !!headerRow;
    if (!isYoteStyle) continue;

    console.log("[parse] Found Yote-style transactions table candidate");

    const entryRows = Array.from(table.querySelectorAll("tr")).filter((tr) => {
      const id = tr.getAttribute("id") || "";
      const cellsCount = tr.querySelectorAll("td,th").length;
      const hasStrongHeaderCells = Array.from(tr.querySelectorAll("td")).every((td) => !!td.querySelector("strong"));
      return (
        !isDetailsRow(tr) &&
        (/EntryRow/i.test(id) || (cellsCount >= 6 && !hasStrongHeaderCells && !tr.querySelector("th")))
      );
    });

    for (const tr of entryRows) {
      const tds = Array.from(tr.querySelectorAll("td"));
      if (tds.length < 5) continue;

      const date = normalize(tds[0]?.textContent);
      const time = normalize(tds[1]?.textContent);
      const description = normalize(tds[2]?.textContent);
      const account = normalize(tds[3]?.textContent);
      const type = normalize(tds[4]?.textContent);
      const amountRaw = getAmount(tds[5] || tds[tds.length - 1]);

      const lower = (description + " " + type).toLowerCase();
      const isCredit = /(credit|reload|deposit|refund)/i.test(lower);
      const isDebit = /(debit|auth|purchase|meal|unit)/i.test(lower);

      let amount = amountRaw;
      if (amount && !/^[-+]/.test(amount)) {
        if (isDebit && !isCredit) amount = "-" + amount; // make likely debits negative for UI coloring
      }

      results.push({ date, time, description, account, type, amount });
      if (results.length >= maxRows) break;
    }

    if (results.length) {
      console.log("[parse] Parsed", results.length, "rows from Yote-style table");
      return results;
    }
  }

  // Fallback: generic logic that also supports <th> header tables
  console.log("[parse] Falling back to generic table scan");
  for (const table of tables) {
    const headersEls = Array.from(table.querySelectorAll("th"));
    const headers = headersEls.map((th) => normalize(th.textContent).toLowerCase());
    let looksLikeTxn = false;

    if (headers.length) {
      looksLikeTxn = headers.some((h) => /date/.test(h)) && headers.some((h) => /(amount|debit|credit|balance)/.test(h));
    } else {
      // Some pages use <td><strong> as header row
      const hdr = Array.from(table.querySelectorAll("tr")).find((tr) => {
        const tds = Array.from(tr.querySelectorAll("td"));
        return tds.length > 0 && tds.every((td) => !!td.querySelector("strong"));
      });
      if (hdr) {
        const hdrCells = Array.from(hdr.querySelectorAll("td")).map((td) => normalize(td.textContent).toLowerCase());
        looksLikeTxn = hdrCells.some((h) => /date/.test(h)) && hdrCells.some((h) => /(amount|debit|credit|balance)/.test(h));
        if (looksLikeTxn) {
          headers.splice(0, headers.length, ...hdrCells);
        }
      }
    }

    if (!looksLikeTxn) continue;
    console.log("[parse] Candidate txn table headers:", headers);

    const rows = [];
    const bodyRows = Array.from(table.querySelectorAll("tr")).filter((tr) => tr.querySelectorAll("td").length > 0 && !isDetailsRow(tr));
    for (const tr of bodyRows) {
      const cells = Array.from(tr.querySelectorAll("td"));
      const values = cells.map((td) => normalize(td.textContent));
      if (values.length === 0) continue;

      let row = {};
      if (headers.length && headers.length === values.length) {
        headers.forEach((h, i) => {
          row[h] = values[i] || "";
        });
        // overwrite amount with numeric-extracted value when we know its column
        const idx = headers.indexOf("amount");
        if (idx >= 0) row.amount = getAmount(cells[idx]);
      } else {
        row = {
          date: values[0] || "",
          description: values[1] || "",
          amount: getAmount(cells[cells.length - 1]),
        };
      }

      rows.push(row);
      if (rows.length >= maxRows) break;
    }

    if (rows.length) {
      console.log("[parse] Parsed txn rows:", rows);
      return rows;
    }
  }

  console.log("[parse] No transactions table matched after fallback");
  return [];
}
