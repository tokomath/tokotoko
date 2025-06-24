import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import {createUser} from "@/app/api/User/createUser";
import {deleteUser} from "@/app/api/User/deleteUser"
import {updateUser} from "@/app/api/User/updateUser"


// POSTリクエスト
export async function POST(req: Request) {
    const SIGNING_SECRET = process.env.SIGNING_SECRET;

    if (!SIGNING_SECRET) {
        throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local');
    }

    // Create new Svix instance with secret
    const wh = new Webhook(SIGNING_SECRET);

    // Get headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error: Missing Svix headers', {
            status: 400,
        });
    }

    // Get body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    let evt: WebhookEvent;

    // Verify payload with headers
    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error: Could not verify webhook:', err);
        return new Response('Error: Verification error', {
            status: 400,
        });
    }

    try {
        switch(evt.type)
        {
            case "user.created":
            {
                const { id, username, first_name, last_name } = evt.data;

                createUser(id, username || `${first_name} ${last_name}`);

                console.log(`User ${id} added to database.`);
                return NextResponse.json({ message: 'User saved to DB' }, { status: 200 });
            }
            case "user.deleted":
            {
                const { id } = evt.data;
                if(id)
                {
                    deleteUser(id);
                    return NextResponse.json({message: 'User deleting is not available'},{status:200});
                }
                break;
            }
            case "user.updated":
            {
                //ユーザー名変更をDBに反映
                const { id, username, first_name, last_name } = evt.data;
                const name:string = username ?  username : first_name ? last_name ? first_name+" "+last_name : first_name : id;
                if(id && name)
                {
                    updateUser(id,name);
                    return NextResponse.json({message: 'Update user info'},{status:200});
                }
            }
            default:
                return NextResponse.json({ message: 'Unhandled event' }, { status: 200 });
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
