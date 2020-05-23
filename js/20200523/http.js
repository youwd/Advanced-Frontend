const getFake = (count) => {
    return new Promise((resolves, reject) => {
        const api = `https://api.randomuser.me/?nat=US&results=${count}`;
        const request = new XMLHttpRequest();
        request.open("GET", api);
        request.onload = () => {
            (request.status === "200") ? resolves(JSON.parse(request.response).result) : reject(Error(request.status.statusText));
        }
        request.onerror = (err) => reject(err);
        request.send();
    });
}

getFake(5).then(member=>console.log(member),err=>console.error(new Error(err)));;