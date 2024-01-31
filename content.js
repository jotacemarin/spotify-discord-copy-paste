const tracklistRow = '[data-testid="tracklist-row"]';
const cellPosition = "5";
const addButtonSelector = "add-button";
const dataTestid = "botnorrea-button";

async function permissionsCheck() {
  const write = await navigator.permissions.query({
    name: "clipboard-write",
  });

  return write.state === "granted";
}

async function updateClipboard(content) {
  if (document.hasFocus()) {
    await navigator.clipboard.writeText(content);
  }
}

function openDiscord() {
  function exec(items) {
    if (items?.ServerId && items?.ChannelId) {
      window.open(
        `discord://-/channels/${items?.ServerId}/${items?.ChannelId}`
      );
    }
  }

  if (chrome?.storage?.local?.get) {
    chrome.storage.local.get(["ServerId", "ChannelId"]).then(exec);
  }
}

function changeTextButton(nameSong) {
  const selector = `${dataTestid}-${nameSong.replace(/\s/g, "-")}`;
  const button = document
    .querySelectorAll(`[data-testid="${selector}"]`)
    ?.item(0);
  if (button) {
    button.innerHTML = "✅";

    setTimeout(function () {
      button.innerHTML = "🐸";
    }, 2000);
  }
}

function clickButton(nameSong) {
  async function exec() {
    await updateClipboard(nameSong);
    changeTextButton(nameSong);
    openDiscord();
  }

  return exec;
}

function buildButton(col, buttonAttr, nameSong) {
  const attr = {
    ...buttonAttr,
    "data-testid": `${dataTestid}-${nameSong.replace(/\s/g, "-")}`,
    "aria-label": "Copy and open Discord",
    "data-encore-id": "Botnorrea",
    tabindex: "-2",
  };

  const botnorreaButton = document.createElement("button");

  for (const [key, value] of Object.entries(attr)) {
    botnorreaButton.setAttribute(key, value);
  }

  botnorreaButton.append("🐸");
  botnorreaButton.addEventListener("click", clickButton(nameSong));

  return botnorreaButton;
}

function getAttrButton(col) {
  let attributes = undefined;

  for (const item of col?.children) {
    if (item.getAttribute("data-testid") === addButtonSelector) {
      attributes = item
        ?.getAttributeNames()
        .map((attr) => ({ key: attr, value: item?.getAttribute(attr) }))
        .reduce((acc, current) => {
          const { key, value } = current;
          return { ...acc, [key]: value };
        }, {});
    }
  }

  return attributes;
}

function buildDiscordCommand(trackRow) {
  const rawNameSong =
    trackRow?.children
      ?.item(0)
      ?.children?.item(0)
      ?.children?.item(1)
      ?.getAttribute("aria-label") ?? "";

  const [_, ...nameSong] = String(rawNameSong).split(" ");
  return `p!play ${nameSong.join(" ")}`;
}

function buildCol(trackRow) {
  const nameSong = buildDiscordCommand(trackRow);

  for (const col of trackRow?.children) {
    if (
      col?.getAttribute("aria-colindex") === cellPosition &&
      col?.children?.length < 4
    ) {
      const buttonAttr = getAttrButton(col);
      const botnorreaButton = buildButton(col, buttonAttr, nameSong);
      col.prepend(botnorreaButton);
    }
  }
}

function buildTrackRow(tracklist) {
  for (const trackRow of tracklist) {
    buildCol(trackRow);
  }
}

async function init() {
  const trackList = document.querySelectorAll(tracklistRow);
  if (!trackList?.length) {
    return;
  }

  await permissionsCheck();
  buildTrackRow(trackList);
}

document.addEventListener("mousemove", function () {
  init();
});
