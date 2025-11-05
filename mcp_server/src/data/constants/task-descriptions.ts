import { TaskType } from '../../rm_task/entities/fact_rm_task.entity';

/**
 * Task descriptions in Vietnamese for different task types
 */
export const taskDescriptions: Record<TaskType, string[]> = {
    [TaskType.CALL]: [
        'Gọi điện tư vấn sản phẩm thẻ tín dụng VPBank',
        'Liên hệ khách hàng về gói ưu đãi lãi suất',
        'Gọi điện xác nhận thông tin cập nhật tài khoản',
        'Tư vấn gói bảo hiểm kết hợp tiết kiệm',
        'Giới thiệu dịch vụ ngân hàng số VPBank NEO',
    ],
    [TaskType.EMAIL]: [
        'Gửi email thông tin sản phẩm đầu tư chứng khoán',
        'Gửi catalog các sản phẩm vay ưu đãi',
        'Gửi báo cáo tài chính định kỳ cho khách hàng',
        'Gửi thông tin về chương trình khuyến mãi mới',
        'Gửi hướng dẫn sử dụng dịch vụ Mobile Banking',
    ],
    [TaskType.MEETING]: [
        'Họp tư vấn kế hoạch tài chính cá nhân',
        'Gặp gỡ thảo luận gói vay mua nhà',
        'Họp giới thiệu sản phẩm Private Banking',
        'Gặp khách hàng để ký hợp đồng vay',
        'Họp tư vấn đầu tư quỹ mở',
    ],
    [TaskType.FOLLOW_UP]: [
        'Theo dõi tiến độ hồ sơ vay của khách hàng',
        'Kiểm tra tình trạng giải quyết khiếu nại',
        'Theo dõi kết quả đăng ký thẻ tín dụng',
        'Cập nhật tình trạng mở tài khoản',
        'Theo dõi phản hồi về dịch vụ',
    ],
    [TaskType.SEND_INFOR_PACKAGE]: [
        'Gửi tài liệu hồ sơ vay tín chấp',
        'Gửi gói thông tin về các sản phẩm tiết kiệm',
        'Gửi bộ hồ sơ mở tài khoản doanh nghiệp',
        'Gửi tài liệu về dịch vụ treasury',
        'Gửi thông tin sản phẩm bảo lãnh ngân hàng',
    ],
};

