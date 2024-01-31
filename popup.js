const storageKey = "botnorrea-data";
const discordServerId = "discordServerId";
const discordChannelId = "discordChannelId";

function getInputs() {
  const serverId = document.getElementById(discordServerId);
  const channelId = document.getElementById(discordChannelId);

  return {
    serverId,
    channelId,
  };
}

function loadData() {
  const { serverId, channelId } = getInputs();

  chrome.storage.local.get(["ServerId", "ChannelId"]).then(function (items) {
    serverId.value = items?.ServerId ?? "";
    channelId.value = items?.ChannelId ?? "";
  });
}

function clickSave() {
  const { serverId, channelId } = getInputs();

  chrome.storage.local
    .set({
      ServerId: serverId.value,
      ChannelId: channelId.value,
    })
    .then(() => {
      window.close();
    });
}

document.getElementById("save").addEventListener("click", clickSave);

loadData();
