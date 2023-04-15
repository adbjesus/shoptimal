import { PrismaClient } from '@prisma/client';
import express, {Express, Request, Response } from 'express';

const prisma = new PrismaClient();
const app: Express = express();
const port = 3000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.send('Hello World!')
});

app.get('/brands', async (_req: Request, res: Response) => {
    const brands = await prisma.brand.findMany();
    res.json(brands);
});

app.get('/chains', async (_req: Request, res: Response) => {
    const chains = await prisma.supermarketChain.findMany();
    res.json(chains);
});

app.get('/locations', async (_req: Request, res: Response) => {
    const locations = await prisma.location.findMany();
    res.json(locations);
});

app.get('/prices', async (_req: Request, res: Response) => {
    const prices = await prisma.price.findMany();
    res.json(prices);
});

app.get('/products', async (_req: Request, res: Response) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
