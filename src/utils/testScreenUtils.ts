export const getLocalizedText = (language: string) => (textFr: string, textVi: string): string => {
    if (language === 'fr') {
        return textFr;
    } else {
        return `${textVi}\n${textFr}`;
    }
};

export const createSubcategoryTestDetails = (getLocalizedText: (textFr: string, textVi: string) => string) => [
    {
        title: getLocalizedText('Tests par Catégorie', 'Bài Kiểm Tra Theo Chủ Đề'),
        description: getLocalizedText(
            'Testez vos connaissances sur des sujets spécifiques comme la monarchie, la révolution, les arts, etc.',
            'Kiểm tra kiến thức của bạn về các chủ đề cụ thể như quân chủ, cách mạng, nghệ thuật, v.v.'
        ),
        icon: 'library',
        iconColor: '#8E44AD',
        details: [
            {
                icon: 'grid',
                text: `12 ${getLocalizedText('catégories', 'chủ đề')}`
            },
            {
                icon: 'flash',
                text: getLocalizedText('Tests courts', 'Bài test ngắn')
            }
        ]
    },
    {
        title: getLocalizedText('Tests Partie 1', 'Bài Kiểm Tra Phần 1'),
        description: getLocalizedText(
            'Tests de conversation et questions personnelles pour préparer l\'entretien de naturalisation.',
            'Bài kiểm tra hội thoại và câu hỏi cá nhân để chuẩn bị cho cuộc phỏng vấn nhập quốc tịch.'
        ),
        icon: 'book',
        iconColor: '#3498DB',
        details: [
            {
                icon: 'people',
                text: `3 ${getLocalizedText('sous-catégories', 'danh mục con')}`
            },
            {
                icon: 'chatbox',
                text: getLocalizedText('Format conversation', 'Định dạng hội thoại')
            }
        ]
    }
];