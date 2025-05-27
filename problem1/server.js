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
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MzI2MjQwLCJpYXQiOjE3NDgzMjU5NDAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6Ijc4YTNiODMwLWUwODAtNDhhYy05MWU2LTA2ZGQyNjJhYTkzYyIsInN1YiI6IjIyMzExYTYyMzRAY3Muc3JlZW5pZGhpLmVkdS5pbiJ9LCJlbWFpbCI6IjIyMzExYTYyMzRAY3Muc3JlZW5pZGhpLmVkdS5pbiIsIm5hbWUiOiJtb2hhbW1hZCBhYmR1bCBmYXJoYXRoIiwicm9sbE5vIjoiMjIzMTFhNjIzNCIsImFjY2Vzc0NvZGUiOiJQQ3FBVUsiLCJjbGllbnRJRCI6Ijc4YTNiODMwLWUwODAtNDhhYy05MWU2LTA2ZGQyNjJhYTkzYyIsImNsaWVudFNlY3JldCI6IlNxWkZVWFRkTnVISldjSEgifQ.eoYf7MWH_p7ufP2g66bgrkFq5fCNaH85C05eZmFVIhw`,
                'Content-Type': 'application/json'
            }
        });
        const numbers = response.data.numbers || [];
        

        for (let num of numbers) {
            if (!currWindow.includes(num)) {
                currWindow.push(num);
            }
        }

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
        console.error(`Error fetching numbers for ID ${id}:`,error.message);
        res.json({
            windowPrevState: prevWindow,
            windowCurrState: currWindow,
            numbers: [],
            avg: getAverage(currWindow)
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
