import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BRANDS, CATEGORIES } from '../../constants/brands';
import { useAuth } from '../../src/modules/auth';
import { usePostsFeed } from '../../src/modules/posts';
import { TagChip } from '../../src/components/ui/TagChip';
import { StatPill } from '../../src/components/ui/StatPill';
import { colors, radii, shadows, spacing, typography } from '../../src/theme';

const FeedScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    posts,
    isLoading,
    errorMessage,
    loadMore,
    hasMore,
    isFetchingMore,
    refresh,
    brandFilter,
    setBrandFilter,
    categoryFilter,
    setCategoryFilter,
    hasActiveFilter,
    clearFilters,
  } = usePostsFeed();

  const brandOptions = useMemo(() => BRANDS.slice().sort(), []);
  const profileInitial = (user?.displayName || user?.email || 'C').charAt(0).toUpperCase();
  const isRefreshing = isLoading && posts.length > 0;
  const activeFiltersCount = useMemo(
    () => [brandFilter, categoryFilter].filter(Boolean).length,
    [brandFilter, categoryFilter]
  );

  useEffect(() => {
    const previewUrls = posts
      .map((post) => post.imageUrls?.[0])
      .filter((url): url is string => typeof url === 'string');
    previewUrls.slice(0, 20).forEach((url) => {
      Image.prefetch(url).catch(() => undefined);
    });
  }, [posts]);

  const renderFilterSection = () => (
    <View style={styles.filterBlock}>
      <View style={styles.filterHeaderRow}>
        <Text style={styles.filterTitle}>브랜드</Text>
        {hasActiveFilter ? (
          <Pressable onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearText}>필터 초기화</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {brandOptions.map((brand) => (
          <TagChip
            key={brand}
            label={brand}
            selected={brandFilter === brand}
            onPress={() => setBrandFilter(brandFilter === brand ? null : brand)}
          />
        ))}
      </ScrollView>

      <Text style={styles.filterTitle}>카테고리</Text>
      <View style={styles.chipWrap}>
        {CATEGORIES.map((category) => (
          <TagChip
            key={category}
            label={category}
            selected={categoryFilter === category}
            onPress={() => setCategoryFilter(categoryFilter === category ? null : category)}
          />
        ))}
      </View>
    </View>
  );

  const renderListHeader = () => (
    <>
      <LinearGradient
        colors={['#f8efe4', '#fdf9f4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.logo}>Catchu Luxury</Text>
            <Text style={styles.subtitle}>프리미엄 인사이트 커뮤니티</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(app)/account')}
            style={styles.profileButton}
          >
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>{profileInitial}</Text>
            </View>
            <Text style={styles.profileLabel}>{user?.displayName ?? '계정 설정'}</Text>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="전체 게시글" value={posts.length} />
          <StatPill
            label="활성 필터"
            value={activeFiltersCount}
            accent={activeFiltersCount ? 'primary' : 'muted'}
          />
          <StatPill
            label="오늘 본 게시글"
            value={Math.min(posts.length, 12)}
            accent="muted"
          />
        </View>
      </LinearGradient>
      {renderFilterSection()}
    </>
  );

  const renderFooter = () => {
    if (!posts.length) {
      return null;
    }
    if (isFetchingMore) {
      return (
        <View style={styles.listFooter}>
          <ActivityIndicator color={colors.textPrimary} />
        </View>
      );
    }
    if (!hasMore) {
      return (
        <View style={styles.listFooter}>
          <Text style={styles.footerText}>모든 소식을 확인했어요.</Text>
        </View>
      );
    }
    return null;
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>아직 게시글이 없어요. 첫 글을 작성해보세요!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : errorMessage ? (
        <View style={styles.errorState}>
          <Text style={styles.errorTitle}>피드를 불러오는 중 문제가 발생했어요.</Text>
          <Text style={styles.errorBody}>{errorMessage}</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isRefreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push({ pathname: '/(app)/post/[id]', params: { id: item.id } })}
              style={styles.card}
            >
              {item.imageUrls?.[0] ? (
                <Image
                  source={{ uri: item.imageUrls[0] }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardImage, styles.cardImageFallback]}>
                  <Text style={styles.cardImageFallbackText}>이미지 준비중</Text>
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.cardBrand}>{item.brand}</Text>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.cardMetaRow}>
                  <Text style={styles.cardAuthor}>{item.authorName ?? '익명'}</Text>
                  <Text style={styles.timestamp}>
                    {item.createdAt ? item.createdAt.toLocaleDateString('ko-KR') : '방금 전'}
                  </Text>
                </View>
                <View style={styles.tagRow}>
                  <Text style={styles.categoryTag}>{item.category}</Text>
                </View>
                <Text style={styles.cardExcerpt} numberOfLines={2}>
                  {item.content}
                </Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <Pressable
        onPress={() => router.push('/(app)/post/new')}
        style={styles.fab}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  hero: {
    paddingHorizontal: spacing(5),
    paddingTop: spacing(4),
    paddingBottom: spacing(5),
    gap: spacing(4),
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    ...typography.heading1,
    fontSize: 28,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 14,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
  },
  profileAvatar: {
    width: spacing(6),
    height: spacing(6),
    borderRadius: radii.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: colors.surfacePrimary,
    fontWeight: '700',
  },
  profileLabel: {
    color: colors.accent,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  filterBlock: {
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(4),
    gap: spacing(3),
    backgroundColor: colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    ...typography.label,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing(2),
    paddingVertical: spacing(1),
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  clearButton: {
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
  },
  clearText: {
    color: colors.accent,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(8),
    gap: spacing(3),
  },
  errorTitle: {
    ...typography.heading2,
    textAlign: 'center',
  },
  errorBody: {
    ...typography.body,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: spacing(30),
    gap: spacing(4),
    backgroundColor: colors.backgroundPrimary,
  },
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.card,
    marginHorizontal: spacing(5),
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardImageFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderSubtle,
  },
  cardImageFallbackText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  cardContent: {
    padding: spacing(4),
    gap: spacing(2),
  },
  cardBrand: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  cardTitle: {
    ...typography.heading2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAuthor: {
    ...typography.caption,
    fontSize: 13,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: spacing(2),
  },
  categoryTag: {
    fontSize: 12,
    backgroundColor: colors.textPrimary,
    color: colors.surfacePrimary,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 12,
  },
  cardExcerpt: {
    ...typography.body,
  },
  listFooter: {
    paddingVertical: spacing(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing(12),
    gap: spacing(2),
  },
  emptyStateText: {
    ...typography.body,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing(6),
    bottom: spacing(6),
    width: spacing(14),
    height: spacing(14),
    borderRadius: radii.pill,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.overlay,
  },
  fabText: {
    color: colors.surfacePrimary,
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },
});

export default FeedScreen;
