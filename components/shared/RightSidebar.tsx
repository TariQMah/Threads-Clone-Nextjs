import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { currentUser } from "@clerk/nextjs";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import SuggestedCard from "@/components/cards/SuggestedCard";

async function RightSidebar() {

    const user = await currentUser();
    if (!user) return null;
    const result = await fetchCommunities({
        searchString: "",
        pageNumber: 1,
        pageSize: 25,
    });


    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) redirect("/onboarding");



    const fetchedUser = await fetchUsers({
        userId: user.id,
        searchString: "",
        pageNumber: 1,
        pageSize: 25,
    });





    return (
        <section className="custom-scrollbar rightsidebar">
            <div className="flex flex-1 flex-col">
                <h3 className="text-heading4-medium text-light-1">Suggested Communites</h3>
                {result.communities.length === 0 ? (
                    <p className='no-result'>No Result</p>
                ) : (
                    <div className="mt-5">
                        {result.communities.map((community) => (
                            <SuggestedCard
                                key={community.id}
                                id={community.id}
                                name={community.name}
                                username={community.username}
                                imgUrl={community.image}
                                bio={community.bio}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col">
                <h3 className="text-heading4-medium text-light-1">Suggested Users</h3>

                {result.communities.length === 0 ? (
                    <p className='no-result'>No Result</p>
                ) : (
                    <div className="mt-5">
                        {fetchedUser.users.map((user) => (
                            <SuggestedCard
                                key={user.id}
                                id={user.id}
                                name={user.name}
                                username={user.username}
                                imgUrl={user.image}
                                bio={user.bio}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default RightSidebar