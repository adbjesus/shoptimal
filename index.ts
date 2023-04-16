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
    for (var j = 0; j < products[i].prices.length; ++j) {
        const s = products[i].prices[j].chainId;
        const aux = products[i].prices[j].price * products[i].quantity;
        curItems.push(s);
        rec(curItems, curCost + aux, products, travelCosts, ansItems, ansTrip, ansCost);
        curItems.pop();
    }
}

function costSingle(s: number, products: any[], travelCosts: number[][]) {
    var cost: number = travelCosts[0][s] + travelCosts[s][0];
    products.forEach((product: any) => {
        for (var price of product.prices) {
            if (price.chainId == s) {
                cost += price.price * product.quantity;
                break;
            }
        }
    });
    return cost;
}

async function optimize_route(cart: any[]) {
    var sortedCart = structuredClone(cart);
    sortedCart.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    var last = null;
    var products = [];
    for (var product of sortedCart) {
        if (last === null || product.id !== last.product.id) {
            last = {
                product: product,
                quantity: 1,
                prices: product.prices,
            };
            products.push(last);
        } else {
            last.quantity += 1;
        }
    }

    // TODO: Hardcoding travel costs, improve
    // TODO: Make travel costs to "locations" instead of "chains"
    const travelCosts = [[ 0, 40, 30, 10, 20],
                         [40,  0, 20, 10, 30],
                         [30, 20,  0, 30, 50],
                         [10, 10, 30,  0, 20],
                         [20, 30, 50, 20,  0]]; // Travel cost
    var ansItems: string[] = [];
    var ansTrip: number[] = [];
    var ansCost = [Number.MAX_SAFE_INTEGER];
    rec([], 0, products, travelCosts, ansItems, ansTrip, ansCost);

    // console.log(ansItems);
    // console.log(ansTrip);
    // console.log(ansCost);
    // console.log(costSingle(1, products, travelCosts));
    // console.log(costSingle(2, products, travelCosts));

    var route = [];
    for (var chain of ansTrip.slice(1)) {
        var aux = [];
        for (var i in ansItems) {
            if (parseInt(ansItems[i]) == chain) {
                aux.push(products[i]);
            }
        }
        route.push({
            chainId: chain,
            // TODO: hardcoding to first location
            location: await prisma.location.findFirst({
                where: { chainId: chain },
                include: { chain: true }
            }),
            products: aux,
        });
    }

    var singleCosts: any[] = [];
    var chains = await prisma.supermarketChain.findMany({ include: { locations: true } });
    console.log(chains);
    for (var cchain of chains) {
        singleCosts.push({
            name: cchain.name + " " + cchain.locations[0].name,
            cost: costSingle(cchain.id, products, travelCosts),
        });
    }
    console.log(singleCosts);

    const ret = {
        route: route,
        cost: ansCost[0],
        singleCosts: singleCosts,
    };

    return ret;
}

app.get('/route', async (req: Request, res: Response) => {
    var cart: any[] = [];
    const session: MySession = req.session;
    if (session.cart) {
        cart = session.cart;
    }

    var route = await optimize_route(cart);

    res.render('route', {
        route: route.route,
        cost: route.cost,
        singleCosts: route.singleCosts,
    });
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
                select: {
                    price: true,
                    chainId: true,
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
            if (session.cart[i].id == id) {
                session.cart.splice(i, 1);
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
