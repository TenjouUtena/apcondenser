import "./style.css"
import { Client } from "archipelago.js";

const chat = document.getElementById("chat");

const clients = [new Client(), new Client()];

var delay = 0;

// supports an arbitrary amount of clients, just add more above and add appropriate inputs to HTML.
for (let i = 0; i < clients.length; i++) {
    const client = clients[i];
    const identifier = `room${i + 1}`;

    const roomname =  document.getElementById(`${identifier}-roomname`);
    const hostname = document.getElementById(`${identifier}-hostname`);
    const username = document.getElementById(`${identifier}-username`);
    const password = document.getElementById(`${identifier}-password`);
    const connect = document.getElementById(`${identifier}-connect`);

    connect.addEventListener("click", () => {
        connect.disabled = true;
        hostname.disabled = true;
        username.disabled = true;
        password.disabled = true;

        client.login(hostname.value, username.value, "", { password: password.value, tags: ["TextOnly"] })
            .then(() => {
                const element = document.createElement("span");
                element.innerText = `${client.name} connected as room: ${identifier}.`;
                addChat(element);
            })
            .catch((error) => {
                alert(error);
                connect.disabled = false;
                hostname.disabled = false;
                username.disabled = false;
                password.disabled = false;
            })
    });

    client.socket.on("disconnected", () => {
        const element = document.createElement("span");
        element.innerText = `${client.name} lost connection to ${identifier}.`;
        addChat(element);

        connect.disabled = false;
        hostname.disabled = false;
        username.disabled = false;
        password.disabled = false;
    });

    client.messages.on("message", (message, nodes) => {
        const container = document.createElement("div");

        const prefix = document.createElement("span");
        if(roomname)
            prefix.innerText = `[${roomname.value}]: `
        else
            prefix.innerText = `[Room #${i + 1}]: `;
        container.appendChild(prefix);

        for (const node of nodes) {
            const element = document.createElement("span");
            switch (node.type) {

                case "entrance":
                    element.innerText = node.text;
                    element.style.color = "#018E42";
                    break;
                case "item":
                    element.innerText = node.item.name;
                    if (node.item.progression) {
                        element.style.color = "#6B49B5";
                    } else if (node.item.useful) {
                        element.style.color = "#2635B8";
                    } else if (node.item.trap) {
                        element.style.color = "#D27138";
                    } else {
                        element.style.color = "#64A0E9";
                    }
                    break;
                case "location":
                    element.innerText = node.text;
                    element.style.color = "#F7D002";
                    break;
                case "color":
                    element.innerText = node.text;
                    element.style.color = node.color;
                    break;
                case "player":
                    element.innerText = node.player.alias;
                    element.style.color = "#BF1A2F";
                    break;
                default:
                case "text":
                    element.innerText = node.text;
                    break;
            }

            container.appendChild(element);
        }

        setTimeout(
            addChat,
            delay,
        container);
    });
}

function setDelay(e) {
    const d = parseInt(e.target.value, 10)
    delay = (isNaN(d) ? 0 : d)*1000
}

const to = document.getElementById("timeout");
to.addEventListener("change", setDelay);

function addChat(element) {
    chat.appendChild(element);
    chat.scrollTop = chat.scrollHeight;
}
