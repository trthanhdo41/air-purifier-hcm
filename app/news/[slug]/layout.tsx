import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  image?: string;
  published_at?: string;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single();

    if (!data) {
      return {
        title: 'Không tìm thấy tin tức',
        description: 'Tin tức bạn đang tìm không tồn tại.',
      };
    }

    const news = data as NewsItem;

    return {
      title: news.meta_title || news.title,
      description: news.meta_description || news.excerpt || news.title,
      keywords: news.meta_keywords,
      openGraph: {
        title: news.meta_title || news.title,
        description: news.meta_description || news.excerpt || news.title,
        images: news.og_image || news.image ? [{ url: news.og_image || news.image || '' }] : [],
        type: 'article',
        publishedTime: news.published_at || undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: news.meta_title || news.title,
        description: news.meta_description || news.excerpt || news.title,
        images: news.og_image || news.image ? [news.og_image || news.image || ''] : [],
      },
    };
  } catch {
    return {
      title: 'Tin tức',
      description: 'Đọc tin tức về máy lọc không khí',
    };
  }
}

export default function NewsDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

