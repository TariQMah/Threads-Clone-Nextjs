"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";


interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}
export async function createThread({ text, author, communityId, path }: Params
) {
    try {
        connectToDB();

        // const communityIdObject = await Community.findOne(
        //     { id: communityId },
        //     { _id: 1 }
        // );

        const createdThread = await Thread.create({
            text,
            author,
            community: null, // Assign communityId if provided, or leave it null for personal account
        });

        // Update User model
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });

        // if (communityIdObject) {
        //     // Update Community model
        //     await Community.findByIdAndUpdate(communityIdObject, {
        //         $push: { threads: createdThread._id },
        //     });
        // }

        revalidatePath(path);
    } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`);
    }
}



export async function fetchPost(pageNumber = 1, pageSize = 20) {
    try {
        connectToDB();

        const skipAmount = (pageNumber - 1) * pageSize

        const postsQuery = Thread.find({
            parentId: {
                $in: [null, undefined]
            }
        })
            .sort({ createdAt: "desc" })
            .skip(skipAmount)
            .limit(pageSize)
            .populate({ path: "author", model: User })
            .populate({
                path: "children",
                populate: { path: "author", model: User, select: "_id name parentId image" }
            })

        const totalPostCount = await Thread.countDocuments({
            parentId: {
                $in: [null, undefined]
            }
        })

        const posts = await postsQuery.exec();

        const isNext = totalPostCount > skipAmount + posts.length;

        return {
            isNext,
            posts
        }

    } catch (error: any) {
        throw new Error(`Failed to create thread: ${error.message}`);
    }
}


export async function fetchThreadById(id: string) {
    try {
        connectToDB();

        //TODO Populat Community
        const thread = Thread.findById(id)
            .populate({
                path: "author",
                model: User,
                select: "_id name image"
            })
            .populate({
                path: "children",
                populate: [{
                    path: "author",
                    model: User,
                    select: "_id id name parentId image"
                }, {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: "author",
                        model: User,
                        select: "_id id name parentId image"
                    }
                }],
                model: User,
                select: "_id name image"
            }).exec()



        return thread;

    } catch (error: any) {
        throw new Error(`Failed to get thread: ${error.message}`);
    }
}