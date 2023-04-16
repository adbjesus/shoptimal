import { PrismaClient } from '@prisma/client';
import express, { Express, Request, Response } from 'express';
import session, { Session } from 'express-session';

const prisma = new PrismaClient();
const app: Express = express();
const port = 3000;

// TODO: make secret an environment variable
// TODO: setup production session configuration (check github.com/expressjs/session)
const sess = { secret: 'shoptimal', cookie: {}, resave: true, saveUninitialized: true };

interface MySession extends Session {
    cart?: any[],
};

app.use(express.json());
app.use(express.static('public'));
app.use(session(sess));

app.set('view engine', 'ejs');

app.get('/', (_req: Request, res: Response) => {
    res.render('landing');
});

app.get('/dashboard', (_req: Request, res: Response) => {
    res.render('dashboard');
});

app.get('/shopping', async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            brand: {
                select: {
                    id: true,
                    name: true,
                },
            },
            prices: {
                orderBy: {
                    price: 'asc',
                },
                select: {
                    price: true,
                },
            },
        },
    });

    var cart: any[] = [];
    const session: MySession = req.session;
    if (session.cart) {
        cart = session.cart;
    }

    console.log(cart);
    console.log(typeof(cart));

    res.render('shopping', { products: products, cart: cart });
});

app.put('/cart/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
        where : {
            id: +id,
        },
        select: {
            id: true,
            name: true,
            brand: {
                select: {
                    id: true,
                    name: true,
                },
            },
            prices: {
                orderBy: {
                    price: 'asc',
                },
                select: {
                    price: true,
                },
            },
        },
    });

    const session: MySession = req.session;
    if (session.cart) {
        session.cart.push(product);
    } else {
        session.cart = [ product ];
    }

    res.json(product);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
