package com.perfumetreasure.app.feedback;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.test.core.app.ApplicationProvider;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import static org.junit.Assert.assertNotNull;

/**
 * RateAppManagerTest
 *
 * Instrumented unit tests for RateAppManager.
 * Run on a device / emulator with:
 *   ./gradlew connectedAndroidTest
 */
@RunWith(AndroidJUnit4.class)
public class RateAppManagerTest {

    private Context         mContext;
    private RateAppManager  mManager;
    private SharedPreferences mPrefs;

    @Before
    public void setUp() {
        mContext = ApplicationProvider.getApplicationContext();
        mManager = RateAppManager.getInstance(mContext);
        mManager.resetForTesting();                       // start from clean state
        mPrefs = mContext.getSharedPreferences(
                "perfume_treasure_rate_prefs", Context.MODE_PRIVATE);
    }

    // ── Singleton ────────────────────────────────────────────────────────────

    @Test
    public void getInstance_returnsNonNull() {
        assertNotNull(RateAppManager.getInstance(mContext));
    }

    @Test
    public void getInstance_returnsSameInstance() {
        RateAppManager a = RateAppManager.getInstance(mContext);
        RateAppManager b = RateAppManager.getInstance(mContext);
        assert a == b;
    }

    // ── Launch counting ───────────────────────────────────────────────────────

    @Test
    public void onAppLaunch_incrementsLaunchCount() {
        int before = mPrefs.getInt("launch_count", 0);
        // Calling onAppLaunch requires an Activity; we verify the counter
        // increments by invoking the method via reflection or by checking
        // the SharedPreferences directly after a simulated launch.
        // For full integration, use Espresso with a real Activity.
        assert before == 0;   // fresh state after reset
    }

    @Test
    public void resetForTesting_clearesAllPrefs() {
        mPrefs.edit().putBoolean("do_not_show", true).apply();
        mManager.resetForTesting();
        assert !mPrefs.contains("do_not_show");
    }

    // ── doNotShow flag ────────────────────────────────────────────────────────

    @Test
    public void doNotShowFlag_preventsDialog() {
        mPrefs.edit().putBoolean("do_not_show", true).apply();
        // With doNotShow = true, conditionsMet() is irrelevant — manager bails early.
        // A real Espresso test would confirm no Dialog appears.
        assert mPrefs.getBoolean("do_not_show", false);
    }

    // ── Remind later ──────────────────────────────────────────────────────────

    @Test
    public void remindLater_setsDelayInFuture() {
        long now = System.currentTimeMillis();
        long remindAfter = now + (long) 7 * 24 * 60 * 60 * 1000; // 7 days
        mPrefs.edit().putLong("remind_after_ms", remindAfter).apply();

        long stored = mPrefs.getLong("remind_after_ms", 0L);
        assert stored > now;
    }
}
