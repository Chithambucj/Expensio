import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import { UserService } from '../../services/user.service';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import dayjs, { Dayjs } from 'dayjs';

import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  transactionService = inject(TransactionService);
  userService = inject(UserService);

  // Static Date Display (Month Start to End)
  currentMonthRange = `${dayjs().startOf('month').format('MMM DD, YYYY')} - ${dayjs().endOf('month').format('MMM DD, YYYY')}`;


  // We keep a default range for the date display in the chart header
  selectedRange = {
    startDate: dayjs().startOf('month'),
    endDate: dayjs().endOf('month')
  };


  // Helper to convert Dayjs to Date for Angular pipes
  toDate(d: Dayjs | any): Date | null {
    return d ? (dayjs.isDayjs(d) ? d.toDate() : new Date(d)) : null;
  }


  // Transaction Stats from Service
  totalExpense = this.transactionService.totalExpense;

  // Real Data for "Total Expenses" Donut
  expenseCategories = computed(() => {
    const transactions = this.transactionService.transactions().filter(t => t.type === 'expense');
    const totals: { [key: string]: number } = {};
    let total = 0;

    transactions.forEach(t => {
      const amount = Math.abs(t.amount);
      totals[t.category] = (totals[t.category] || 0) + amount;
      total += amount;
    });

    const colors = ['#f09b4e', '#efff27', '#24c3f3ff', '#26d279', '#b618ffff', '#cacd05ff', '#ff7676ff'];

    return Object.keys(totals).map((label, i) => ({
      label,
      value: totals[label],
      pct: total > 0 ? (totals[label] / total) * 100 : 0,
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value);
  });

  // --- Advanced Dashboard Metrics ---

  currentMonthSpend = computed(() => {
    const now = dayjs();
    return this.transactionService.transactions()
      .filter(t => t.type === 'expense' && dayjs(t.date).isSame(now, 'month'))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  });

  lastMonthSpend = computed(() => {
    const lastMonth = dayjs().subtract(1, 'month');
    return this.transactionService.transactions()
      .filter(t => t.type === 'expense' && dayjs(t.date).isSame(lastMonth, 'month'))
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  });

  percentageChange = computed(() => {
    const current = this.currentMonthSpend();
    const last = this.lastMonthSpend();
    if (last === 0) return current > 0 ? 100 : 0;
    return ((current - last) / last) * 100;
  });

  currentMonthCount = computed(() => {
    const now = dayjs();
    return this.transactionService.transactions()
      .filter(t => t.type === 'expense' && dayjs(t.date).isSame(now, 'month'))
      .length;
  });

  healthScore = computed(() => {
    // Simple logic: Base 100. Deduct points if spending > 50% of income (assumed budget).
    // since we don't have income, let's use a heuristic based on spend growth.
    // Logic: 80 base. + points if spend < last month. - points if spend > last month.
    // Clamped 0-100.
    const change = this.percentageChange();
    let score = 80;
    if (change < 0) score += 10; // Savings!
    if (change > 10) score -= 10; // Overspending warning
    if (change > 30) score -= 10; // Critical
    return Math.max(0, Math.min(100, score));
  });

  averageDailySpend = computed(() => {
    const expenses = this.currentMonthSpend();
    const daysPassed = dayjs().date();
    return expenses / daysPassed;
  });

  donutChartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.expenseCategories().map(c => c.label),
    datasets: [{
      data: this.expenseCategories().map(c => c.value),
      backgroundColor: this.expenseCategories().map(c => c.color),
      hoverOffset: 4,
      borderWidth: 0,
    }]
  }));

  donutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: { legend: { display: false } }
  };

  // Real Data for Line Chart (Balance Over Time)
  lineChartData = computed<ChartData<'line'>>(() => {
    const transactions = [...this.transactionService.transactions()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by month
    const monthlyBalance: { [key: string]: number } = {};
    let runningBalance = 0;

    transactions.forEach(t => {
      const month = dayjs(t.date).format('MMM');
      runningBalance += Math.abs(t.amount); // Cumulative Expenses
      monthlyBalance[month] = runningBalance;
    });

    const labels = Object.keys(monthlyBalance);
    const data = Object.values(monthlyBalance);

    return {
      labels: labels.length > 0 ? labels : ['No Data'],
      datasets: [
        {
          data: data.length > 0 ? data : [0],
          label: 'Total Expenses',
          borderColor: '#4318ff',
          backgroundColor: 'rgba(67, 24, 255, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
  });

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: true }, y: { display: true } }
  };

  expenseHistoryTimeframe = signal<'weekly' | 'monthly' | 'yearly'>('monthly');
  selectedCategory = signal<string>('All');

  setExpenseHistoryTimeframe(timeframe: 'weekly' | 'monthly' | 'yearly') {
    this.expenseHistoryTimeframe.set(timeframe);
  }

  availableCategories = computed(() => {
    const transactions = this.transactionService.transactions().filter(t => t.type === 'expense');
    const categories = new Set(transactions.map(t => t.category));
    return ['All', ...Array.from(categories)];
  });

  // Real Data for Bar Chart (Weekly/Monthly/Yearly Expense)
  barChartData = computed<ChartData<'bar'>>(() => {
    let transactions = this.transactionService.transactions().filter(t => t.type === 'expense');

    if (this.selectedCategory() !== 'All') {
      transactions = transactions.filter(t => t.category === this.selectedCategory());
    }

    const timeframe = this.expenseHistoryTimeframe();
    let labels: string[] = [];
    let data: number[] = [];

    if (timeframe === 'weekly') {
      labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      data = new Array(7).fill(0);
      const startOfWeek = dayjs().startOf('week');
      const endOfWeek = dayjs().endOf('week');

      transactions.forEach(t => {
        const d = dayjs(t.date);
        if (d.isAfter(startOfWeek.subtract(1, 'ms')) && d.isBefore(endOfWeek.add(1, 'ms'))) {
          data[d.day()] += Math.abs(t.amount);
        }
      });
    } else if (timeframe === 'monthly') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = new Array(12).fill(0);
      const currentYear = dayjs().year();

      transactions.forEach(t => {
        const d = dayjs(t.date);
        if (d.year() === currentYear) {
          data[d.month()] += Math.abs(t.amount);
        }
      });
    } else if (timeframe === 'yearly') {
      const yearMap: { [year: string]: number } = {};
      transactions.forEach(t => {
        const year = dayjs(t.date).format('YYYY');
        yearMap[year] = (yearMap[year] || 0) + Math.abs(t.amount);
      });
      labels = Object.keys(yearMap).sort();
      data = labels.map(year => yearMap[year]);

      if (labels.length === 0) {
        labels = [dayjs().format('YYYY')];
        data = [0];
      }
    }

    return {
      labels,
      datasets: [
        { data, label: 'Expense', backgroundColor: '#1f5e91', borderRadius: 5 }
      ]
    };
  });

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { display: true } }
  };
}
