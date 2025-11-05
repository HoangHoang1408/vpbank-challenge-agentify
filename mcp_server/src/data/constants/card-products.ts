import { CardType, CardNetwork } from '../../card/entities/card.entity';

/**
 * Card product interface
 */
export interface CardProduct {
    cardType: CardType;
    cardProductName: string;
    cardDescription: string;
    targetDescription: string;
    cardNetwork: CardNetwork;
}

/**
 * VPBank card products data
 */
export const cardProducts: CardProduct[] = [
    // Credit Cards
    {
        cardType: CardType.CREDIT,
        cardProductName: 'VPBank Z JCB',
        cardDescription: 'Cho phép chi tiêu trước, trả sau - Hoàn tiền cao (lên đến 10%) cho chi tiêu online - Miễn phí thường niên (theo điều kiện chi tiêu)',
        targetDescription: 'Giới trẻ, dân văn phòng, người chi tiêu online thường xuyên',
        cardNetwork: CardNetwork.VISA, // Note: JCB not in enum, using VISA
    },
    {
        cardType: CardType.CREDIT,
        cardProductName: 'VPBank Shopee Platinum',
        cardDescription: 'Thanh toán và hoàn tiền cho mua sắm trên Shopee - Ưu đãi freeship, voucher độc quyền - Miễn phí thường niên',
        targetDescription: 'Người mua sắm nhiều trên Shopee hoặc hệ sinh thái SEA Group',
        cardNetwork: CardNetwork.VISA,
    },
    {
        cardType: CardType.CREDIT,
        cardProductName: 'VPBank Visa Signature Travel Miles',
        cardDescription: 'Tích dặm bay khi chi tiêu - Quyền lợi cao cấp tại sân bay (lounge, ưu tiên check-in) - Bảo hiểm du lịch toàn cầu',
        targetDescription: 'Người hay đi công tác hoặc du lịch quốc tế',
        cardNetwork: CardNetwork.VISA,
    },
    {
        cardType: CardType.CREDIT,
        cardProductName: 'VPBank MC Platinum',
        cardDescription: 'Hoàn tiền cho chi tiêu ăn uống, giải trí - Tích điểm thưởng đổi quà - Mức phí hợp lý',
        targetDescription: 'Người tiêu dùng thành thị, gia đình',
        cardNetwork: CardNetwork.MASTERCARD,
    },
    {
        cardType: CardType.CREDIT,
        cardProductName: 'VPBank StepUp Visa',
        cardDescription: 'Hoàn tiền cho giao dịch trực tuyến, ăn uống - Tích lũy điểm đổi quà - Quản lý chi tiêu qua ứng dụng',
        targetDescription: 'Người chi tiêu đa dạng, quản lý tài chính cá nhân',
        cardNetwork: CardNetwork.VISA,
    },
    {
        cardType: CardType.CREDIT,
        cardProductName: 'VPBank Lady Card',
        cardDescription: 'Thiết kế riêng cho nữ - Hoàn tiền cao cho mua sắm, spa, mỹ phẩm - Tặng bảo hiểm dành cho phụ nữ',
        targetDescription: 'Khách hàng nữ có thu nhập ổn định',
        cardNetwork: CardNetwork.VISA,
    },
    // Debit Cards
    {
        cardType: CardType.DEBIT,
        cardProductName: 'VPBank Visa Prime Platinum',
        cardDescription: 'Chi tiêu, rút tiền từ số dư tài khoản - Hoàn tiền 3% cho chi tiêu thẻ - Thanh toán toàn cầu qua Visa',
        targetDescription: 'Người muốn chi tiêu bằng tiền thật, không dùng tín dụng',
        cardNetwork: CardNetwork.VISA,
    },
    {
        cardType: CardType.DEBIT,
        cardProductName: 'VPBank Diamond Debit',
        cardDescription: 'Dành cho khách hàng ưu tiên (Diamond) - Hoàn tiền 1–1,2% theo mức chi tiêu - Miễn phí rút tiền ATM, quyền lợi VIP',
        targetDescription: 'Khách hàng cao cấp, thu nhập cao',
        cardNetwork: CardNetwork.VISA,
    },
    {
        cardType: CardType.DEBIT,
        cardProductName: 'VPBank MC Debit Standard',
        cardDescription: 'Thanh toán quốc tế, trực tuyến - Rút tiền tại ATM toàn cầu - Dễ mở, liên kết tài khoản thanh toán',
        targetDescription: 'Người dùng phổ thông, sinh viên, nhân viên văn phòng',
        cardNetwork: CardNetwork.MASTERCARD,
    },
];

