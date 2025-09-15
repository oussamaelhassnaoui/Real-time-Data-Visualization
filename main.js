document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('myChart').getContext('2d');
    const websocketUrlInput = document.getElementById('websocket-url');
    const copyButton = document.getElementById('copy-button');
    const yMinInput = document.getElementById('y-min');
    const yMaxInput = document.getElementById('y-max');
    const applyYAxisButton = document.getElementById('apply-y-axis');

    const websocketUrl = `ws://${window.location.host}`;
    websocketUrlInput.value = websocketUrl;

    copyButton.addEventListener('click', () => {
        websocketUrlInput.select();
        document.execCommand('copy');

        copyButton.textContent = 'Copied!';
        copyButton.classList.add('copied');

        setTimeout(() => {
            copyButton.textContent = 'Copy';
            copyButton.classList.remove('copied');
        }, 2000);
    });

    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Real-time Data',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'realtime',
                    realtime: {
                        duration: 20000,
                        refresh: 1000,
                        delay: 2000
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    applyYAxisButton.addEventListener('click', () => {
        const yMin = parseFloat(yMinInput.value);
        const yMax = parseFloat(yMaxInput.value);

        if (!isNaN(yMin)) {
            myChart.options.scales.y.min = yMin;
        }

        if (!isNaN(yMax)) {
            myChart.options.scales.y.max = yMax;
        }

        myChart.update();
    });

    const ws = new WebSocket(websocketUrl);

    ws.onmessage = (event) => {
        console.log('Received data:', event.data);
        let value;
        try {
            const data = JSON.parse(event.data);
            if (typeof data === 'object' && data !== null && 'value' in data) {
                value = data.value;
            } else {
                value = data;
            }
        } catch (e) {
            value = parseFloat(event.data);
        }

        console.log('Parsed value:', value);

        if (!isNaN(value)) {
            myChart.data.datasets[0].data.push({
                x: Date.now(),
                y: value
            });
            myChart.update();
        }
    };
});
