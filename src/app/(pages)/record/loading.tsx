export default function RecordLoading() {
    return (
        <div className="w-full max-w-[1440px] min-h-screen mx-auto flex flex-col items-center overflow-x-hidden">
            {/* 몰입 기록 섹션 */}
            <div className="w-full mt-[60px]">
                <div className="flex items-center gap-5 mb-5">
                    <div className="w-[100px] h-8 bg-gray-200 animate-pulse rounded-md" />
                    <div className="w-[300px] h-6 bg-gray-200 animate-pulse rounded-md" />
                </div>
                <div className="w-full h-[230px] bg-white rounded-[20px] shadow-sm animate-pulse" />
            </div>

            {/* 대시보드 섹션 */}
            <div className="w-full">
                <div className="flex items-center gap-5 mb-5 mt-12">
                    <div className="w-[80px] h-8 bg-gray-200 animate-pulse rounded-md" />
                    <div className="w-[250px] h-6 bg-gray-200 animate-pulse rounded-md" />
                </div>
                <div className="w-full h-[400px] bg-white rounded-[20px] shadow-sm animate-pulse" />
            </div>
        </div>
    );
}
