import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const WINDOW_SIZE = 10;
let prevWindow = [];
let currWindow = [];

function getAverage(numbers) {
    if (numbers.length === 0) return 0;
    let sum = 0;
    for (const num of numbers) {
        sum += num;
    }
    return parseFloat((sum / numbers.length).toFixed(2));
}

app.get('/numbers/:id', async (req, res) => {
    // console.log(req.params);
    const { id } = req.params;
    // console.log(id);

    let url;
    if( id === 'p') {
        url = 'http://20.244.56.144/evaluation-service/primes';
    }
    else if (id === 'f') {
        url = 'http://20.244.56.144/evaluation-service/fibo';
    }
    else if (id === 'e') {
        url = 'http://20.244.56.144/evaluation-service/even';
    }
    else if (id === 'r') {
        url = 'http://20.244.56.144/evaluation-service/rand';
    }
    if (!url) {
        return res.status(400).json({ error: 'invalid id'});
    }

    // console.log(url);
    
    try {
        prevWindow = [...currWindow];
        
        const response = await axios.get(url,{
            timeout: 500,
            headers: {
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        const numbers = response.data.numbers || [];
        // console.log(numbers);

        for (let num of numbers) {
            if (!currWindow.includes(num)) {
                currWindow.push(num);
            }
        }
        // console.log(currWindow);

        if (currWindow.length>WINDOW_SIZE) {
            currWindow = currWindow.slice(-WINDOW_SIZE);
        }
        
        res.json({
            windowPrevState: prevWindow,
            windowCurrState: currWindow,
            numbers: numbers,
            avg: getAverage(currWindow)
        });
        
    } catch (error) {
        console.error(`error fetching numbers for ${id}:`,error.message);
        res.json({
            windowPrevState: prevWindow,
            windowCurrState: currWindow,
            numbers: [],
            avg: getAverage(currWindow)
        });
    }
});

const PORT = process.env.PORT;
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`);
});
