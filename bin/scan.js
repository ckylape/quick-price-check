#!/usr/bin/env node

const path = require('path')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')
const nodemailer = require('nodemailer')
const mailgun = require('nodemailer-mailgun-transport')
const Email = require('email-templates')
const {
    URL
} = require('url')
const adapter = new FileAsync(path.resolve(__dirname, '../db.json'))

function scrape(content, hostname) {
    let price = 99999999999.99
    const $ = cheerio.load(content)

    return new Promise((resolve) => {

        switch (hostname) {
        case 'www.tigerdirect.com':
            price = $('span.salePrice').text()
            break
        case 'www.newegg.com':
            price = $('.price-main-product > li.price-current').text()
            break
        case 'www.amazon.com':
            price = $('#priceblock_ourprice').text()
            break
        case 'www.microcenter.com':
            var single = $('#pricing').text()
            if (single) {
                price = single
            } else {
                price = $('h1 > span[itemprop=name] > span').data('price').toString()
            }
            break
        default:
            break
        }

        if (price != 99999999999.99) {
            price = parseFloat(price.replace('$', '')).toFixed(2)
        }

        resolve(price)
    })
}

async function sendEmail(alerts) {
    const db = await low(adapter)
    const conf = await db.get('settings').value()
    const auth = {
        auth: {
            api_key: conf.MailgunTo,
            domain: conf.MailgunDomain
        }
    }
    const email = new Email({
        message: {
            from: {
                address: 'no-reply@locahost',
                name: 'Price-Watch Update'
            }
        },
        transport: nodemailer.createTransport(mailgun(auth)),
        views: {
            root: path.resolve(__dirname, '../views/emails'),
            options: {
                extension: 'ejs'
            }
        }
    })
    await email.send({
        template: '.',
        message: {
            to: conf.MailgunTo,
            subject: 'PRICE ALERT!'
        },
        locals: {
            alerts: alerts
        }
    })
}

async function main() {
    try {
        let alerts = []
        const db = await low(adapter)
        const items = await db.get('items').value()
        const browser = await puppeteer.launch({
            headless: true
        })

        // loop through items
        for (const item of items) {

            const lowest = (item.best.hasOwnProperty('lowest') ? item.best.lowest : 99999999999.99)
            let best = {
                url: '',
                price: 99999999999.99,
                lowest: lowest
            }

            // loop through items to find the best price
            await Promise.all(item.urls.map(async(url) => {
                const parsed = new URL(url)
                const page = await browser.newPage()

                await page.goto(parsed.href, {
                    waitUntil: 'networkidle2',
                    timeout: 120000,
                })

                const content = await page.content()
                const price = await scrape(content, parsed.hostname)

                // compare with "current" best price
                if (price < best.price) {
                    best['url'] = parsed.href
                    best['price'] = price
                }

                // check lowest price
                if (price < best.lowest) {
                    console.log('[ALERT] Lowest seen price: ' + item.name + ' @ $' + price)
                    best['lowest'] = price
                }

                await page.close()

            }))

            await db.get('items').find({
                name: item.name
            }).assign({
                best: best
            }).write()

            if (best.price <= item.alert) {
                alerts.push({
                    item: item.name,
                    cat: item.category,
                    url: best.url,
                    price: best.price
                })
            }

            console.log('[INFO] Updated: ' + item.name)

        }

        await browser.close()

        if (alerts.length > 0) {
            await sendEmail(alerts)
        }

        const used = await process.memoryUsage().heapUsed / 1024 / 1024
        console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB of RAM`)
        process.exit(0)
    } catch (err) {
        console.log('[ERROR] An error has occured while scanning!')
        console.log(err)
        process.exit(1)
    }

}

main()
