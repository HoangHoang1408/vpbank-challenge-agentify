import { Gender } from '../../customer/entities/customer.entity';
import {
    vietnameseLastNames,
    vietnameseMaleMiddleNames,
    vietnameseFemaleMiddleNames,
    vietnameseMaleFirstNames,
    vietnameseFemaleFirstNames,
    vietnameseCities,
    vietnameseStreets,
} from '../constants/vietnamese-data';

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: T[]): T {
    return array[randomInt(0, array.length - 1)];
}

/**
 * Generate a Vietnamese name based on gender
 */
export function generateVietnameseName(gender: Gender): string {
    const lastName = randomElement(vietnameseLastNames);

    if (gender === Gender.MALE) {
        const middleName = randomElement(vietnameseMaleMiddleNames);
        const firstName = randomElement(vietnameseMaleFirstNames);
        return `${lastName} ${middleName} ${firstName}`;
    } else if (gender === Gender.FEMALE) {
        const middleName = randomElement(vietnameseFemaleMiddleNames);
        const firstName = randomElement(vietnameseFemaleFirstNames);
        return `${lastName} ${middleName} ${firstName}`;
    } else {
        const middleName = randomElement([...vietnameseMaleMiddleNames, ...vietnameseFemaleMiddleNames]);
        const firstName = randomElement([...vietnameseMaleFirstNames, ...vietnameseFemaleFirstNames]);
        return `${lastName} ${middleName} ${firstName}`;
    }
}

/**
 * Generate a Vietnamese address with city, district, and street
 */
export function generateVietnameseAddress(): { address: string; state: string; zip: string } {
    const cityData = randomElement(vietnameseCities);
    const district = randomElement(cityData.districts);
    const street = randomElement(vietnameseStreets);
    const houseNumber = randomInt(1, 999);

    return {
        address: `${houseNumber} ${street}, ${district}`,
        state: cityData.city,
        zip: `${randomInt(100000, 999999)}`
    };
}

/**
 * Generate an email address from a Vietnamese name
 */
export function generateEmail(name: string): string {
    const nameWithoutAccents = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '.');
    const domains = ['gmail.com', 'vpbank.com.vn', 'outlook.com', 'yahoo.com'];
    return `${nameWithoutAccents}${randomInt(1, 999)}@${randomElement(domains)}`;
}

/**
 * Generate a Vietnamese phone number
 */
export function generatePhone(): string {
    const prefixes = ['091', '094', '088', '083', '084', '085', '081', '082', '096', '097', '098', '032', '033', '034', '035', '036', '037', '038', '039'];
    return `+84${randomElement(prefixes)}${randomInt(1000000, 9999999)}`;
}

/**
 * Generate a date of birth within an age range
 */
export function generateDOB(minAge: number, maxAge: number): Date {
    const today = new Date();
    const birthYear = today.getFullYear() - randomInt(minAge, maxAge);
    const birthMonth = randomInt(0, 11);
    const birthDay = randomInt(1, 28);
    return new Date(birthYear, birthMonth, birthDay);
}

/**
 * Generate a unique task ID
 */
export function generateTaskId(): string {
    return `TASK-${Date.now()}-${randomInt(1000, 9999)}`;
}

/**
 * Generate a unique customer ID
 */
export function generateCustomerId(): string {
    return `CUS-${randomInt(100000, 999999)}`;
}

/**
 * Generate a unique employee ID
 */
export function generateEmployeeId(): number {
    return randomInt(10000, 99999);
}

/**
 * Generate a behavior description for customer spending patterns
 */
export function generateBehaviorDescription(): string {
    const spendingPatterns = [
        'Chi tiêu ổn định, thường xuyên thanh toán hóa đơn điện nước và mua sắm tạp hóa',
        'Thích mua sắm trực tuyến, đặc biệt là thời trang và đồ điện tử',
        'Chi tiêu cao cho ẩm thực, thường xuyên đặt món qua ứng dụng giao đồ ăn',
        'Ưu tiên chi tiêu cho du lịch và giải trí, đặt vé máy bay và khách sạn thường xuyên',
        'Chi tiêu tiết kiệm, chủ yếu cho nhu cầu thiết yếu và ít giao dịch xa xỉ',
        'Thường xuyên mua sắm tại siêu thị và trung tâm thương mại vào cuối tuần',
        'Chi tiêu mạnh tay cho sức khỏe và làm đẹp, thường xuyên sử dụng dịch vụ spa và gym',
        'Đam mê công nghệ, thường xuyên mua thiết bị điện tử và phụ kiện cao cấp',
        'Chi tiêu cho giáo dục và phát triển bản thân, đăng ký khóa học trực tuyến',
        'Thích mua sắm hàng hiệu và xa xỉ, giao dịch tại các cửa hàng cao cấp',
        'Chi tiêu đều đặn cho gia đình, mua sắm đồ dùng cho con cái và người thân',
        'Ưu tiên thanh toán không tiền mặt, sử dụng thẻ cho mọi giao dịch',
        'Chi tiêu theo mùa, tăng cao vào dịp lễ tết và giảm vào các tháng thường',
        'Thường xuyên đầu tư vào sở thích cá nhân như nhiếp ảnh, âm nhạc hoặc thể thao',
        'Chi tiêu thông minh, luôn tìm kiếm ưu đãi và chương trình khuyến mãi',
        'Giao dịch quốc tế thường xuyên, chi tiêu ngoại tệ khi đi công tác hoặc du lịch',
        'Chi tiêu cao cho xe cộ và phương tiện di chuyển, bảo dưỡng định kỳ',
        'Thích trải nghiệm dịch vụ cao cấp, thường xuyên sử dụng thẻ tại nhà hàng sang trọng',
        'Chi tiêu đa dạng, cân bằng giữa nhu cầu thiết yếu và giải trí',
        'Xu hướng chi tiêu tăng dần theo thời gian, phản ánh thu nhập ổn định'
    ];

    const paymentHabits = [
        'Luôn thanh toán đúng hạn và đầy đủ số tiền',
        'Thích thanh toán trả góp cho các giao dịch lớn',
        'Thường xuyên sử dụng tính năng rút tiền mặt',
        'Ưu tiên thanh toán online và ít sử dụng tiền mặt',
        'Thanh toán linh hoạt, đôi khi trả tối thiểu khi cần thiết',
        'Thích tích lũy điểm thưởng và đổi quà',
        'Sử dụng nhiều thẻ khác nhau cho các mục đích chi tiêu',
        'Thanh toán tập trung vào đầu tháng sau khi nhận lương'
    ];

    const loyaltyTraits = [
        'Khách hàng trung thành, sử dụng dịch vụ ngân hàng lâu năm',
        'Thường xuyên tham gia các chương trình khuyến mãi của ngân hàng',
        'Có xu hướng giới thiệu dịch vụ cho bạn bè và người thân',
        'Quan tâm đến các sản phẩm tài chính mới',
        'Thích được tư vấn cá nhân hóa từ chuyên gia tài chính',
        'Sẵn sàng nâng cấp lên các sản phẩm cao cấp hơn',
        'Thường xuyên phản hồi và đánh giá dịch vụ',
        'Tương tác tích cực qua ứng dụng di động và internet banking'
    ];

    // Generate monthly spending amount (in VND)
    const spendingRanges = [
        { min: 5000000, max: 15000000, label: 'Chi tiêu trung bình' },
        { min: 15000000, max: 30000000, label: 'Chi tiêu khá' },
        { min: 30000000, max: 50000000, label: 'Chi tiêu cao' },
        { min: 50000000, max: 100000000, label: 'Chi tiêu rất cao' },
        { min: 100000000, max: 200000000, label: 'Chi tiêu VIP' },
    ];

    const spendingRange = randomElement(spendingRanges);
    const monthlyAmount = randomInt(spendingRange.min, spendingRange.max);
    const formattedAmount = monthlyAmount.toLocaleString('vi-VN');

    const spending = randomElement(spendingPatterns);
    const payment = randomElement(paymentHabits);
    const loyalty = randomElement(loyaltyTraits);

    return `${spending}. ${payment}. ${loyalty}. ${spendingRange.label} khoảng ${formattedAmount} VNĐ/tháng.`;
}

