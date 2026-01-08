export default function MyPageLoading() {
    return (
        <div className="w-full max-w-[1440px] h-full pt-9 mx-auto flex gap-5 items-stretch overflow-x-hidden">
            <section className="flex flex-col gap-5 self-stretch w-[360px] animate-pulse">
                <div className="w-full h-[120px] rounded-[20px] bg-white border border-gray-100 shadow-sm" />
                <div className="w-full h-[260px] rounded-[20px] bg-white border border-gray-100 shadow-sm" />
            </section>

            <section className="w-full self-stretch animate-pulse">
                <div className="w-full h-[552px] rounded-[20px] bg-white border border-gray-100 shadow-sm" />
            </section>
        </div>
    );
}
