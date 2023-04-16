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

    res.render('shopping', { products: products, cart: cart });
});

function trip_rec(
    cost: number,
    trip: number[],
    visited: boolean[],
    supermarkets: string[],
    travelCosts: number[][],
    bestTrip: number[],
    bestCost: number[],
) {
    if (trip.length == supermarkets.length+1) {
        const prev = trip[trip.length-1];
        cost += travelCosts[prev][0];
        if (cost < bestCost[0]) {
            bestCost[0] = cost;
            for (var i = 0; i < trip.length; ++i) {
                bestTrip[i] = trip[i];
            }
        }
    }

    for (var i = 0; i < supermarkets.length; ++i) {
        const s = parseInt(supermarkets[i]);
        if (!visited[s]) {
            const prev = trip[trip.length-1];
            const aux = travelCosts[prev][s];
            trip.push(s);
            visited[s] = true;
            trip_rec(cost+aux, trip, visited, supermarkets, travelCosts, bestTrip, bestCost);
            visited[s] = false;
            trip.pop();
        }
    }
}

function rec(
    curItems: string[],
    curCost: number,
    products: any[],
    travelCosts: number[][],
    ansItems: string[],
    ansTrip: number[],
    ansCost: number[],
) {
    if (curItems.length == products.length) {
        const supermarkets: string[] = Array.from(new Set(curItems));
        var trip: number[] = Array(supermarkets.length+1).fill(-1);
        var tripCost: number[] = [Number.MAX_SAFE_INTEGER];
        var visited: boolean[] = Array(travelCosts.length).fill(false);
        trip_rec(0, [0], visited, supermarkets, travelCosts, trip, tripCost);
        curCost += tripCost[0];
        if (curCost < ansCost[0]) {
            var j = 0;
            for (j = 0; j < curItems.length; ++j) {
                ansItems[j] = curItems[j];
            }
            for (j = 0; j < trip.length; ++j) {
                ansTrip[j] = trip[j];
            }
            while(ansTrip.length > trip.length) {
                ansTrip.pop();
            }
            ansCost[0] = curCost;
        }
        return;
    }

    const i = curItems.length;
    const keys = Object.keys(products[i].prices);
    for (var j = 0; j < keys.length; ++j) {
        const s = keys[j];
        const aux = products[i].prices[s] * products[i].quantity;
        curItems.push(s);
        rec(curItems, curCost + aux, products, travelCosts, ansItems, ansTrip, ansCost);
        curItems.pop();
    }
}

function costSingle(s: number, products: any[], travelCosts: number[][]) {
    var cost: number = travelCosts[0][s] + travelCosts[s][0];
    products.forEach((product: any) => {
        cost += product.prices[s] * product.quantity;
    });
    return cost;
}

function optimize_route() {
    const products = [
        {
            productId: 1,
            quantity: 3,
            prices: {
                1: 1.39,
                2: 1.69,
            },
        },
        {
            productId: 2,
            quantity: 5,
            prices: {
                1: 1.6,
                2: 1.5,
            },
        }
    ];
    const travelCosts = [[0, 1, 3], [1, 0, 2], [3, 2, 0]]; // Travel cost
    var ansItems: string[] = [];
    var ansTrip: number[] = [];
    var ansCost = [Number.MAX_SAFE_INTEGER];
    rec([], 0, products, travelCosts, ansItems, ansTrip, ansCost);
    console.log(ansItems);
    console.log(ansTrip);
    console.log(ansCost);
    console.log(costSingle(1, products, travelCosts));
    console.log(costSingle(2, products, travelCosts));
}

app.get('/route', async (req: Request, res: Response) => {
    var cart: any[] = [];
    const session: MySession = req.session;
    if (session.cart) {
        cart = session.cart;
    }

    var route: any[] = [];

    optimize_route();

    res.render('route', { cart: cart, route: route });
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

app.delete('/cart/:id', async (req: Request, res: Response) => {
    res.status(404);

    const id = parseInt(req.params.id);

    const session: MySession = req.session;
    if (session.cart) {
        var l = session.cart.length;
        for (var i = 0; i < l; ++i) {
            console.log(session.cart[i].id, id);
            if (session.cart[i].id == id) {
                session.cart.splice(i, 1);
                console.log(session.cart);
                res.status(204);
                break;
            }
        }
    }
    res.json();
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});
